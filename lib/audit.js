'use strict';

const crypto = require('crypto');
const db = require.main.require('./src/database');
const winston = require.main.require('winston');

const settings = require('./settings');

const ENTRY_PREFIX = 'plugin:account-retention:entry:';
const LOG_KEY = 'plugin:account-retention:log';
const UID_INDEX_PREFIX = 'plugin:account-retention:uid:';

const VALID_ACTIONS = new Set([
	'warning_sent',
	'final_warning_sent',
	'deletion_notice_sent',
	'deleted',
	'keepalive_used',
	'skipped_exempt',
	'skipped_dryrun',
	'would_warn',
	'would_delete',
	'cron_started',
	'cron_finished',
	'cron_error',
]);

function hashEmail(email) {
	if (!email) return '';
	return crypto.createHash('sha256').update(String(email).toLowerCase().trim()).digest('hex').slice(0, 16);
}

exports.record = async ({ uid = 0, action, email = '', daysInactive = null, dryRun = false, meta: extraMeta = {}, error = null } = {}) => {
	if (!action || !VALID_ACTIONS.has(action)) {
		winston.warn('[plugin/account-retention] audit.record: invalid action ' + action);
		return null;
	}
	try {
		const createdAt = Date.now();
		const id = `${createdAt}-${uid}-${action}-${Math.random().toString(36).slice(2, 8)}`;
		const row = {
			uid: parseInt(uid, 10) || 0,
			action,
			emailHash: hashEmail(email),
			daysInactive: daysInactive == null ? '' : Math.round(daysInactive),
			dryRun: !!dryRun,
			error: error ? String(error).slice(0, 500) : '',
			metaJson: JSON.stringify(extraMeta || {}),
			createdAt,
		};

		await db.setObject(ENTRY_PREFIX + id, row);
		await db.sortedSetAdd(LOG_KEY, createdAt, id);
		if (row.uid) {
			await db.sortedSetAdd(UID_INDEX_PREFIX + row.uid, createdAt, id);
		}

		await prune();
		return { id, ...row };
	} catch (err) {
		winston.warn('[plugin/account-retention] audit record failed: ' + err.message);
		return null;
	}
};

async function prune() {
	const retentionDays = parseInt(settings.get().auditRetentionDays, 10) || 1095;
	const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
	const toDrop = await db.getSortedSetRangeByScore(LOG_KEY, 0, 100, 0, cutoff);
	if (!toDrop || !toDrop.length) return;
	for (const id of toDrop) {
		const row = await db.getObject(ENTRY_PREFIX + id);
		await db.delete(ENTRY_PREFIX + id);
		await db.sortedSetRemove(LOG_KEY, id);
		if (row && row.uid) {
			await db.sortedSetRemove(UID_INDEX_PREFIX + row.uid, id);
		}
	}
}

exports.list = async ({ start = 0, stop = 49, filter = {} } = {}) => {
	const ids = await db.getSortedSetRevRange(LOG_KEY, start, stop);
	if (!ids || !ids.length) return [];
	const rows = await Promise.all(ids.map(id => db.getObject(ENTRY_PREFIX + id).then(r => r ? { id, ...r } : null)));
	return rows.filter(r => {
		if (!r) return false;
		if (filter.action && r.action !== filter.action) return false;
		if (filter.uid && String(r.uid) !== String(filter.uid)) return false;
		if (filter.dryRun != null && Boolean(r.dryRun) !== Boolean(filter.dryRun)) return false;
		return true;
	});
};

exports.listForUid = async (uid, { start = 0, stop = 49 } = {}) => {
	const ids = await db.getSortedSetRevRange(UID_INDEX_PREFIX + uid, start, stop);
	if (!ids || !ids.length) return [];
	const rows = await Promise.all(ids.map(id => db.getObject(ENTRY_PREFIX + id).then(r => r ? { id, ...r } : null)));
	return rows.filter(Boolean);
};

exports.lastActionForUid = async (uid, action) => {
	const ids = await db.getSortedSetRevRange(UID_INDEX_PREFIX + uid, 0, -1);
	if (!ids || !ids.length) return null;
	for (const id of ids) {
		const row = await db.getObject(ENTRY_PREFIX + id);
		if (row && row.action === action) return { id, ...row };
	}
	return null;
};

exports.totals = async () => {
	const ids = await db.getSortedSetRevRange(LOG_KEY, 0, -1);
	if (!ids || !ids.length) return { total: 0, byAction: {} };
	const rows = await Promise.all(ids.map(id => db.getObject(ENTRY_PREFIX + id)));
	const byAction = {};
	for (const r of rows) {
		if (!r) continue;
		byAction[r.action] = (byAction[r.action] || 0) + 1;
	}
	return { total: ids.length, byAction };
};
