'use strict';

const user = require.main.require('./src/user');
const winston = require.main.require('winston');

const settings = require('./settings');
const audit = require('./audit');
const mailer = require('./mailer');
const keepalive = require('./keepalive');

exports.deleteUser = async ({ uid, username, email, daysInactive }) => {
	const s = settings.get();

	await mailer.sendDeletionNotice({ uid, username, email, daysInactive });
	await audit.record({
		uid,
		action: 'deletion_notice_sent',
		email,
		daysInactive,
		dryRun: s.dryRun,
	});

	if (s.dryRun) {
		await audit.record({
			uid,
			action: 'skipped_dryrun',
			email,
			daysInactive,
			dryRun: true,
			meta: { wouldDelete: true },
		});
		return { deleted: false, dryRun: true };
	}

	try {
		await keepalive.invalidateForUid(uid);
		await user.deleteAccount(uid);
		await audit.record({
			uid,
			action: 'deleted',
			email,
			daysInactive,
			dryRun: false,
		});
		winston.info('[plugin/account-retention] deleted account uid=' + uid + ' (' + Math.round(daysInactive) + ' days inactive)');
		return { deleted: true };
	} catch (err) {
		winston.error('[plugin/account-retention] delete failed uid=' + uid + ': ' + err.message);
		await audit.record({
			uid,
			action: 'cron_error',
			email,
			daysInactive,
			error: err.message,
		});
		return { deleted: false, error: err.message };
	}
};
