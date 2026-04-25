'use strict';

const db = require.main.require('./src/database');
const user = require.main.require('./src/user');
const groups = require.main.require('./src/groups');
const winston = require.main.require('winston');

const settings = require('./settings');
const audit = require('./audit');
const mailer = require('./mailer');
const deleter = require('./deleter');

const DAY_MS = 24 * 60 * 60 * 1000;

async function getExemptUidSet() {
	const s = settings.get();
	const set = new Set(settings.getExemptUids());
	const exemptGroups = settings.getExemptGroups();
	for (const g of exemptGroups) {
		try {
			const members = await groups.getMembers(g, 0, -1);
			for (const m of members || []) {
				const id = parseInt(m, 10);
				if (id) set.add(id);
			}
		} catch (err) {
			winston.warn('[plugin/account-retention] failed to expand group "' + g + '": ' + err.message);
		}
	}
	return set;
}

function classify({ daysInactive, inactivityDays, warningDays }) {
	if (daysInactive >= inactivityDays) {
		return { stage: 'delete', daysUntilDelete: 0 };
	}
	const sortedDesc = warningDays.slice().sort((a, b) => b - a);
	for (const wd of sortedDesc) {
		const triggerAt = inactivityDays - wd;
		if (daysInactive >= triggerAt) {
			const isFinal = wd === Math.min(...warningDays);
			return {
				stage: isFinal ? 'final_warning' : 'warning',
				daysUntilDelete: wd,
				warningDay: wd,
			};
		}
	}
	return { stage: 'safe', daysUntilDelete: inactivityDays - daysInactive };
}

async function loadUser(uid) {
	const u = await user.getUserFields(uid, ['uid', 'username', 'email', 'lastonline', 'joindate', 'banned', 'deleted']);
	return u;
}

async function getActivityTs(u) {
	const lastonline = parseInt(u.lastonline, 10) || 0;
	const joindate = parseInt(u.joindate, 10) || 0;
	return Math.max(lastonline, joindate);
}

async function shouldSkip({ u, exempt, includeBanned, includeNeverLoggedIn }) {
	if (!u || !u.uid) return 'no-user';
	if (u.deleted) return 'already-deleted';
	if (exempt.has(parseInt(u.uid, 10))) return 'exempt';
	if (!includeBanned && parseInt(u.banned, 10)) return 'banned';
	if (!includeNeverLoggedIn && (!parseInt(u.lastonline, 10))) return 'never-logged-in';
	if (!u.email) return 'no-email';
	return null;
}

async function alreadyHandled(uid, action, withinDays = 7) {
	const last = await audit.lastActionForUid(uid, action);
	if (!last) return false;
	const ageDays = (Date.now() - parseInt(last.createdAt, 10)) / DAY_MS;
	return ageDays < withinDays;
}

exports.preview = async ({ limit = 500 } = {}) => {
	return scan({ limit, dryRunOverride: true, sendEmails: false, persistAudit: false });
};

exports.run = async ({ limit = 0 } = {}) => {
	return scan({ limit, dryRunOverride: null, sendEmails: true, persistAudit: true });
};

async function scan({ limit, dryRunOverride, sendEmails, persistAudit }) {
	const s = settings.get();
	const inactivityDays = parseInt(s.inactivityDays, 10);
	const warningDays = settings.getWarningDays();
	const startTs = Date.now();
	const dryRun = dryRunOverride != null ? dryRunOverride : s.dryRun;

	const installedAt = parseInt(s.installedAt, 10) || startTs;
	const graceMs = (parseInt(s.gracePeriodDaysAfterInstall, 10) || 0) * DAY_MS;
	const inGracePeriod = (startTs - installedAt) < graceMs;

	if (persistAudit) {
		await audit.record({ action: 'cron_started', meta: { dryRun, inactivityDays, warningDays, inGracePeriod } });
	}

	const exempt = await getExemptUidSet();
	const allUids = await db.getSortedSetRange('users:joindate', 0, -1);
	const total = allUids ? allUids.length : 0;

	const summary = {
		total,
		examined: 0,
		skipped: 0,
		warningsSent: 0,
		finalWarningsSent: 0,
		deleted: 0,
		errors: 0,
		dryRun,
		inGracePeriod,
		pending: [],
	};

	if (inGracePeriod && !dryRun) {
		winston.info('[plugin/account-retention] in grace period, no destructive actions');
		if (persistAudit) {
			await audit.record({ action: 'cron_finished', meta: { ...summary, reason: 'grace-period' } });
		}
		return summary;
	}

	const examineLimit = limit > 0 ? Math.min(limit, total) : total;

	for (let i = 0; i < total; i++) {
		if (summary.examined >= examineLimit) break;
		const uid = parseInt(allUids[i], 10);
		if (!uid) continue;

		let u;
		try {
			u = await loadUser(uid);
		} catch (err) {
			summary.errors++;
			continue;
		}

		const skipReason = await shouldSkip({
			u,
			exempt,
			includeBanned: s.includeBanned,
			includeNeverLoggedIn: s.includeNeverLoggedIn,
		});

		summary.examined++;
		if (skipReason) {
			summary.skipped++;
			continue;
		}

		const activityTs = await getActivityTs(u);
		if (!activityTs) {
			summary.skipped++;
			continue;
		}
		const daysInactive = (startTs - activityTs) / DAY_MS;
		const verdict = classify({ daysInactive, inactivityDays, warningDays });

		if (verdict.stage === 'safe') continue;

		const ctx = {
			uid,
			username: u.username,
			email: u.email,
			daysInactive,
			daysUntilDelete: verdict.daysUntilDelete,
		};

		if (verdict.stage === 'delete') {
			if (dryRun) {
				summary.pending.push({ ...ctx, action: 'delete' });
				if (persistAudit) {
					await audit.record({ uid, action: 'would_delete', email: u.email, daysInactive, dryRun: true });
				}
			} else {
				if (sendEmails) {
					const res = await deleter.deleteUser(ctx);
					if (res.deleted) summary.deleted++;
					else if (res.error) summary.errors++;
				}
			}
			continue;
		}

		const isFinal = verdict.stage === 'final_warning';
		const auditAction = isFinal ? 'final_warning_sent' : 'warning_sent';

		if (await alreadyHandled(uid, auditAction, Math.max(1, verdict.warningDay - 1))) {
			continue;
		}

		if (dryRun) {
			summary.pending.push({ ...ctx, action: isFinal ? 'final_warning' : 'warning' });
			if (persistAudit) {
				await audit.record({ uid, action: 'would_warn', email: u.email, daysInactive, dryRun: true, meta: { isFinal, daysUntilDelete: verdict.daysUntilDelete } });
			}
			continue;
		}

		if (sendEmails) {
			const res = await mailer.sendWarning({ ...ctx, isFinal });
			if (res.sent) {
				if (isFinal) summary.finalWarningsSent++;
				else summary.warningsSent++;
				await audit.record({ uid, action: auditAction, email: u.email, daysInactive });
			}
		}
	}

	summary.elapsedMs = Date.now() - startTs;
	if (persistAudit) {
		await audit.record({ action: 'cron_finished', meta: summary });
	}
	winston.info('[plugin/account-retention] scan finished: ' + JSON.stringify({
		examined: summary.examined, skipped: summary.skipped,
		warningsSent: summary.warningsSent, finalWarningsSent: summary.finalWarningsSent,
		deleted: summary.deleted, errors: summary.errors, dryRun, elapsedMs: summary.elapsedMs,
	}));
	return summary;
}
