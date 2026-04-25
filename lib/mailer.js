'use strict';

const nconf = require.main.require('nconf');
const winston = require.main.require('winston');
const meta = require.main.require('./src/meta');
const emailer = require.main.require('./src/emailer');

const settings = require('./settings');
const keepalive = require('./keepalive');

const TEMPLATES = {
	warning: 'account-retention-warning',
	finalWarning: 'account-retention-final-warning',
	deleted: 'account-retention-deleted',
};

exports.TEMPLATES = TEMPLATES;

exports.registerTemplates = (emails) => {
	const list = Array.isArray(emails) ? emails.slice() : [];
	for (const t of Object.values(TEMPLATES)) {
		if (!list.includes(t)) list.push(t);
	}
	return list;
};

function siteBase() {
	return nconf.get('url') || '';
}

async function buildKeepaliveUrl(uid) {
	try {
		const token = await keepalive.create(uid);
		return siteBase().replace(/\/$/, '') + '/inactivity/keepalive/' + token;
	} catch (err) {
		winston.warn('[plugin/account-retention] failed to build keepalive url uid=' + uid + ': ' + err.message);
		return '';
	}
}

function commonParams({ uid, username, email, daysInactive, daysUntilDelete, keepaliveUrl }) {
	const s = settings.get();
	return {
		uid,
		username: username || '',
		email: email || '',
		daysInactive: Math.round(daysInactive || 0),
		daysUntilDelete: Math.round(daysUntilDelete || 0),
		inactivityDays: s.inactivityDays,
		keepaliveUrl: keepaliveUrl || '',
		site_title: meta.config.title || meta.config.browserTitle || 'NodeBB',
		base_url: siteBase(),
		showUnsubscribe: false,
	};
}

async function sendDirect(to, template, params, subject) {
	if (!to) return false;
	try {
		await emailer.sendToEmail(template, to, meta.config.defaultLang || 'en-GB', {
			...params,
			subject,
		});
		return true;
	} catch (err) {
		winston.warn('[plugin/account-retention] sendToEmail failed (' + template + ') to ' + to + ': ' + err.message);
		return false;
	}
}

exports.sendWarning = async ({ uid, username, email, daysInactive, daysUntilDelete, isFinal = false }) => {
	const s = settings.get();
	if (s.dryRun && !s.emailsEnabledInDryRun) return { sent: false, dryRun: true };
	if (!email) return { sent: false, reason: 'no-email' };

	const keepaliveUrl = await buildKeepaliveUrl(uid);
	const params = commonParams({ uid, username, email, daysInactive, daysUntilDelete, keepaliveUrl });
	const template = isFinal ? TEMPLATES.finalWarning : TEMPLATES.warning;
	const subject = isFinal
		? `[[email:account-retention.final-warning.subject, ${params.site_title}, ${params.daysUntilDelete}]]`
		: `[[email:account-retention.warning.subject, ${params.site_title}, ${params.daysUntilDelete}]]`;
	const sent = await sendDirect(email, template, params, subject);
	return { sent };
};

exports.sendDeletionNotice = async ({ uid, username, email, daysInactive }) => {
	const s = settings.get();
	if (s.dryRun && !s.emailsEnabledInDryRun) return { sent: false, dryRun: true };
	if (!email) return { sent: false, reason: 'no-email' };

	const params = commonParams({ uid, username, email, daysInactive, daysUntilDelete: 0, keepaliveUrl: '' });
	const subject = `[[email:account-retention.deleted.subject, ${params.site_title}]]`;
	const sent = await sendDirect(email, TEMPLATES.deleted, params, subject);
	return { sent };
};
