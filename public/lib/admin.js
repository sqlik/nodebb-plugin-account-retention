'use strict';

/* globals $, socket */

import { save, load } from 'settings';
import * as alerts from 'alerts';

function fmtTime(ts) {
	if (!ts) return '';
	const d = new Date(parseInt(ts, 10));
	return d.toISOString().replace('T', ' ').slice(0, 19);
}

const ACTION_BADGE_CLASS = {
	warning_sent: 'bg-info text-dark',
	final_warning_sent: 'bg-warning text-dark',
	deletion_notice_sent: 'bg-warning text-dark',
	deleted: 'bg-danger',
	keepalive_used: 'bg-success',
	skipped_dryrun: 'bg-secondary',
	would_delete: 'bg-danger',
	would_warn: 'bg-info text-dark',
	cron_started: 'bg-light text-dark',
	cron_finished: 'bg-light text-dark',
	cron_error: 'bg-danger',
};

const PENDING_BADGE_CLASS = {
	delete: 'bg-danger',
	final_warning: 'bg-warning text-dark',
	warning: 'bg-info text-dark',
};

function badge(text, className) {
	const span = document.createElement('span');
	span.className = 'badge ' + (className || 'bg-secondary');
	span.textContent = String(text);
	return span;
}

function cell(text) {
	const td = document.createElement('td');
	td.textContent = text == null ? '' : String(text);
	return td;
}

function cellWith(node, extraClass) {
	const td = document.createElement('td');
	if (extraClass) td.className = extraClass;
	td.appendChild(node);
	return td;
}

function emptyRow(colspan, message) {
	const tr = document.createElement('tr');
	const td = document.createElement('td');
	td.colSpan = colspan;
	td.className = 'text-muted';
	td.textContent = message;
	tr.appendChild(td);
	return tr;
}

function replaceTbody(selector, rowNodes) {
	const tbody = document.querySelector(selector);
	if (!tbody) return;
	while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
	for (const r of rowNodes) tbody.appendChild(r);
}

function setText(selector, text) {
	const el = document.querySelector(selector);
	if (el) el.textContent = text;
}

function renderPending(rows, summary) {
	if (!rows || !rows.length) {
		replaceTbody('#pending-table tbody', [emptyRow(5, 'No users pending action.')]);
	} else {
		replaceTbody('#pending-table tbody', rows.map(r => {
			const tr = document.createElement('tr');
			tr.appendChild(cell(r.uid));
			tr.appendChild(cell(r.username || ''));
			tr.appendChild(cell(Math.round(r.daysInactive)));
			tr.appendChild(cellWith(badge(r.action, PENDING_BADGE_CLASS[r.action] || 'bg-secondary')));
			tr.appendChild(cell(r.action === 'delete' ? 0 : Math.round(r.daysUntilDelete)));
			return tr;
		}));
	}
	if (summary) {
		setText('#pending-summary',
			`examined: ${summary.examined} · skipped: ${summary.skipped} · pending: ${(rows||[]).length}` +
			` · dryRun: ${summary.dryRun ? 'yes' : 'no'} · grace: ${summary.inGracePeriod ? 'yes' : 'no'}` +
			` · ${summary.elapsedMs || 0}ms`
		);
	}
}

function renderAudit(rows, totals) {
	if (!rows || !rows.length) {
		replaceTbody('#audit-table tbody', [emptyRow(6, 'No audit entries yet.')]);
	} else {
		replaceTbody('#audit-table tbody', rows.map(r => {
			const tr = document.createElement('tr');
			tr.appendChild(cellWith(document.createTextNode(fmtTime(r.createdAt)), 'text-nowrap small'));
			tr.appendChild(cell(r.uid || ''));
			tr.appendChild(cellWith(badge(r.action, ACTION_BADGE_CLASS[r.action] || 'bg-secondary')));
			tr.appendChild(cell(r.daysInactive || ''));
			tr.appendChild(cell((String(r.dryRun) === 'true' || r.dryRun === true) ? 'yes' : ''));
			tr.appendChild(cellWith(document.createTextNode(r.error || ''), 'small text-danger'));
			return tr;
		}));
	}
	if (totals) {
		const parts = Object.entries(totals.byAction || {}).map(([k, v]) => `${k}: ${v}`).join(' · ');
		setText('#audit-totals', `total: ${totals.total || 0} · ${parts}`);
	}
}

async function refreshPending() {
	try {
		const res = await socket.emit('plugins.accountRetention.preview', {});
		renderPending(res.pending || [], res);
	} catch (err) {
		alerts.error(err.message || 'Preview failed');
	}
}

async function refreshAudit() {
	try {
		const [rows, totals] = await Promise.all([
			socket.emit('plugins.accountRetention.listAudit', { start: 0, stop: 99 }),
			socket.emit('plugins.accountRetention.auditTotals', {}),
		]);
		renderAudit(rows || [], totals || {});
	} catch (err) {
		alerts.error(err.message || 'Audit refresh failed');
	}
}

export function init() {
	load('account-retention', $('.account-retention-settings'));

	$('#save').on('click', () => {
		save('account-retention', $('.account-retention-settings'), async () => {
			try {
				await socket.emit('plugins.accountRetention.reload', {});
				alerts.success('[[admin/plugins/account-retention:saved]]');
			} catch (err) {
				alerts.error(err.message || 'Reload failed');
			}
		});
	});

	$('#preview-btn').on('click', refreshPending);
	$('#audit-refresh').on('click', refreshAudit);
	$('#run-now-btn').on('click', async () => {
		if (!confirm('Run scan now? This will send emails and (if dryRun is off) DELETE accounts.')) return;
		try {
			const res = await socket.emit('plugins.accountRetention.runNow', { force: true });
			alerts.success('Scan finished. Examined ' + res.examined + ', deleted ' + res.deleted + ', warnings ' + (res.warningsSent + res.finalWarningsSent));
			await refreshAudit();
		} catch (err) {
			alerts.error(err.message || 'Run failed');
		}
	});

	refreshAudit();
}
