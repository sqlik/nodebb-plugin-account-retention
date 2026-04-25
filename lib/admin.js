'use strict';

const settings = require('./settings');

exports.renderAdminPage = (req, res) => {
	const s = settings.get();
	res.render('admin/plugins/account-retention', {
		title: 'Account Retention',

		enabled: s.enabled,
		dryRun: s.dryRun,

		inactivityDays: s.inactivityDays,
		warningDays: s.warningDays,

		includeBanned: s.includeBanned,
		includeNeverLoggedIn: s.includeNeverLoggedIn,
		gracePeriodDaysAfterInstall: s.gracePeriodDaysAfterInstall,

		exemptUids: s.exemptUids,
		exemptGroups: s.exemptGroups,

		keepaliveTokenTtlDays: s.keepaliveTokenTtlDays,

		cronHour: s.cronHour,
		emailsEnabledInDryRun: s.emailsEnabledInDryRun,

		auditRetentionDays: s.auditRetentionDays,

		installedAt: s.installedAt,
	});
};
