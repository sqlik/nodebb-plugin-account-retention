'use strict';

const meta = require.main.require('./src/meta');
const winston = require.main.require('winston');

const DEFAULTS = {
	enabled: false,
	dryRun: true,

	inactivityDays: 365,
	warningDays: '30,7',

	includeBanned: true,
	includeNeverLoggedIn: true,
	gracePeriodDaysAfterInstall: 14,

	exemptUids: '',
	exemptGroups: 'administrators,Global Moderators',

	keepaliveTokenTtlDays: 14,

	cronHour: 3,
	emailsEnabledInDryRun: false,

	auditRetentionDays: 1095,

	installedAt: 0,
};

const NUM_FIELDS = [
	'inactivityDays',
	'keepaliveTokenTtlDays',
	'cronHour',
	'auditRetentionDays',
	'gracePeriodDaysAfterInstall',
	'installedAt',
];

const BOOL_FIELDS = ['enabled', 'dryRun', 'includeBanned', 'includeNeverLoggedIn', 'emailsEnabledInDryRun'];

let cache = { ...DEFAULTS };

function parseBool(v) {
	return String(v) === 'true' || v === true || v === 'on' || v === 1 || v === '1';
}

async function seedMissingDefaults(stored) {
	const patch = {};
	let seeded = 0;
	for (const [k, v] of Object.entries(DEFAULTS)) {
		const current = stored[k];
		if (current === undefined || current === null) {
			patch[k] = v;
			stored[k] = v;
			seeded++;
		}
	}
	if (!stored.installedAt || parseInt(stored.installedAt, 10) === 0) {
		const now = Date.now();
		patch.installedAt = now;
		stored.installedAt = now;
		seeded++;
	}
	if (seeded > 0) {
		try {
			await meta.settings.set('account-retention', patch, true);
			winston.verbose('[plugin/account-retention] seeded ' + seeded + ' default setting(s) to DB');
		} catch (err) {
			winston.warn('[plugin/account-retention] failed to seed defaults: ' + err.message);
		}
	}
	return stored;
}

exports.load = async () => {
	let stored = await meta.settings.get('account-retention') || {};
	stored = await seedMissingDefaults(stored);
	cache = { ...DEFAULTS, ...stored };

	for (const f of NUM_FIELDS) {
		cache[f] = parseFloat(cache[f]);
		if (isNaN(cache[f])) cache[f] = DEFAULTS[f];
	}
	for (const f of BOOL_FIELDS) {
		cache[f] = parseBool(cache[f]);
	}

	if (cache.inactivityDays < 30) cache.inactivityDays = 30;
	if (cache.keepaliveTokenTtlDays < 1) cache.keepaliveTokenTtlDays = 1;
	if (cache.auditRetentionDays < 30) cache.auditRetentionDays = 30;
	if (cache.gracePeriodDaysAfterInstall < 0) cache.gracePeriodDaysAfterInstall = 0;
	if (cache.cronHour < 0 || cache.cronHour > 23) cache.cronHour = DEFAULTS.cronHour;

	return cache;
};

exports.get = () => cache;

exports.getWarningDays = () => {
	const arr = String(cache.warningDays || '')
		.split(',')
		.map(s => parseInt(s.trim(), 10))
		.filter(n => Number.isFinite(n) && n > 0);
	const unique = Array.from(new Set(arr));
	unique.sort((a, b) => b - a);
	return unique;
};

exports.getExemptUids = () => String(cache.exemptUids || '')
	.split(',')
	.map(s => parseInt(s.trim(), 10))
	.filter(n => Number.isFinite(n) && n > 0);

exports.getExemptGroups = () => String(cache.exemptGroups || '')
	.split(',')
	.map(s => s.trim())
	.filter(Boolean);

exports.DEFAULTS = DEFAULTS;
