'use strict';

const winston = require.main.require('winston');
const db = require.main.require('./src/database');

const settings = require('./settings');
const scanner = require('./scanner');
const audit = require('./audit');

const LAST_RUN_KEY = 'plugin:account-retention:cron:last-run-day';
const TICK_INTERVAL_MS = 60 * 60 * 1000;

let timer = null;
let running = false;

function todayKey(d = new Date()) {
	return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}

async function maybeRun() {
	if (running) return;
	const s = settings.get();
	if (!s.enabled) return;

	const now = new Date();
	if (now.getUTCHours() < parseInt(s.cronHour, 10)) return;

	const lastRun = await db.get(LAST_RUN_KEY);
	if (lastRun === todayKey(now)) return;

	running = true;
	try {
		await db.set(LAST_RUN_KEY, todayKey(now));
		await scanner.run({});
	} catch (err) {
		winston.error('[plugin/account-retention] scheduled run failed: ' + err.message);
		await audit.record({ action: 'cron_error', error: err.message });
	} finally {
		running = false;
	}
}

exports.start = () => {
	if (timer) return;
	timer = setInterval(() => {
		maybeRun().catch(err => winston.warn('[plugin/account-retention] cron tick error: ' + err.message));
	}, TICK_INTERVAL_MS);
	if (timer.unref) timer.unref();
	winston.verbose('[plugin/account-retention] cron started, tick=' + TICK_INTERVAL_MS + 'ms');
	setTimeout(() => maybeRun().catch(() => {}), 30 * 1000);
};

exports.stop = () => {
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
};

exports.runNow = async ({ force = false } = {}) => {
	if (running) throw new Error('Already running');
	running = true;
	try {
		if (force) {
			await db.delete(LAST_RUN_KEY);
		}
		return await scanner.run({});
	} finally {
		running = false;
	}
};

exports.isRunning = () => running;
