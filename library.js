'use strict';

const winston = require.main.require('winston');

const settings = require('./lib/settings');
const admin = require('./lib/admin');
const audit = require('./lib/audit');
const scanner = require('./lib/scanner');
const cron = require('./lib/cron');
const keepalive = require('./lib/keepalive');
const mailer = require('./lib/mailer');

const plugin = {};

plugin.init = async (params) => {
	const { router, middleware } = params;

	router.get('/admin/plugins/account-retention', middleware.admin.buildHeader, admin.renderAdminPage);
	router.get('/api/admin/plugins/account-retention', admin.renderAdminPage);

	router.get('/inactivity/keepalive/:token', async (req, res) => {
		const result = await keepalive.consume(String(req.params.token || ''));
		if (result.ok) {
			res.status(200).type('html').send(renderKeepalivePage('ok'));
		} else {
			const code = result.reason === 'expired' ? 410 : 404;
			res.status(code).type('html').send(renderKeepalivePage(result.reason || 'invalid'));
		}
	});

	await settings.load();

	const sockets = require.main.require('./src/socket.io/plugins');
	sockets.accountRetention = sockets.accountRetention || {};

	sockets.accountRetention.reload = async (socket) => {
		await assertAdmin(socket);
		await settings.load();
		return { ok: true };
	};

	sockets.accountRetention.preview = async (socket) => {
		await assertAdmin(socket);
		return scanner.preview({ limit: 1000 });
	};

	sockets.accountRetention.runNow = async (socket, data) => {
		await assertAdmin(socket);
		const force = !!(data && data.force);
		return cron.runNow({ force });
	};

	sockets.accountRetention.listAudit = async (socket, data) => {
		await assertAdmin(socket);
		const start = parseInt(data?.start, 10) || 0;
		const stop = parseInt(data?.stop, 10) || 49;
		return audit.list({ start, stop, filter: data?.filter || {} });
	};

	sockets.accountRetention.auditTotals = async (socket) => {
		await assertAdmin(socket);
		return audit.totals();
	};

	cron.start();

	winston.verbose(
		'[plugin/account-retention] initialised (enabled=' + settings.get().enabled +
		', dryRun=' + settings.get().dryRun +
		', inactivityDays=' + settings.get().inactivityDays + ')'
	);
};

plugin.addAdminMenu = async (header) => {
	header.plugins.push({
		route: '/plugins/account-retention',
		icon: 'fa-user-clock',
		name: 'Account Retention',
	});
	return header;
};

plugin.registerEmailTypes = async (data) => {
	data.types = mailer.registerTemplates(data.types || []);
	return data;
};

plugin.onUserOnline = async ({ uid }) => {
	if (!uid) return;
	try {
		await keepalive.invalidateForUid(uid);
	} catch (err) {
		winston.warn('[plugin/account-retention] onUserOnline cleanup failed uid=' + uid + ': ' + err.message);
	}
};

async function assertAdmin(socket) {
	const user = require.main.require('./src/user');
	const isAdmin = await user.isAdministrator(socket.uid);
	if (!isAdmin) throw new Error('[[error:no-privileges]]');
}

function renderKeepalivePage(state) {
	const messages = {
		ok: { title: 'Account kept active', body: 'Thanks — your inactivity counter has been reset. You can close this tab.' },
		expired: { title: 'Link expired', body: 'This keep-alive link has expired. Please log in to the forum normally to keep your account active.' },
		invalid: { title: 'Invalid link', body: 'This keep-alive link is not valid. It may have already been used.' },
		'user-gone': { title: 'Account no longer exists', body: 'The account associated with this link has already been removed.' },
		error: { title: 'Something went wrong', body: 'An error occurred. Please try again later or log in to the forum normally.' },
		missing: { title: 'Missing token', body: 'No token supplied.' },
	};
	const m = messages[state] || messages.invalid;
	return `<!doctype html><html><head><meta charset="utf-8"><title>${m.title}</title>` +
		`<meta name="viewport" content="width=device-width,initial-scale=1">` +
		`<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#222}` +
		`h1{font-size:22px;margin-bottom:12px}p{line-height:1.5;color:#444}</style></head><body>` +
		`<h1>${m.title}</h1><p>${m.body}</p></body></html>`;
}

module.exports = plugin;
