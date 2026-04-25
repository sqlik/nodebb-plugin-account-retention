'use strict';

const crypto = require('crypto');
const db = require.main.require('./src/database');
const user = require.main.require('./src/user');
const winston = require.main.require('winston');

const settings = require('./settings');
const audit = require('./audit');

const TOKEN_PREFIX = 'plugin:account-retention:keepalive:';
const UID_TOKEN_KEY = 'plugin:account-retention:keepalive-uid:';

function newToken() {
	return crypto.randomBytes(24).toString('base64url');
}

exports.create = async (uid) => {
	if (!uid) throw new Error('uid required');
	const token = newToken();
	const ttlMs = (parseInt(settings.get().keepaliveTokenTtlDays, 10) || 14) * 24 * 60 * 60 * 1000;
	const expiresAt = Date.now() + ttlMs;
	await db.setObject(TOKEN_PREFIX + token, {
		uid: parseInt(uid, 10),
		createdAt: Date.now(),
		expiresAt,
	});
	await db.pexpire(TOKEN_PREFIX + token, ttlMs);
	await db.sortedSetAdd(UID_TOKEN_KEY + uid, expiresAt, token);
	return token;
};

exports.consume = async (token) => {
	if (!token) return { ok: false, reason: 'missing' };
	const row = await db.getObject(TOKEN_PREFIX + token);
	if (!row) return { ok: false, reason: 'invalid' };
	const expiresAt = parseInt(row.expiresAt, 10) || 0;
	if (expiresAt && expiresAt < Date.now()) {
		await db.delete(TOKEN_PREFIX + token);
		return { ok: false, reason: 'expired' };
	}
	const uid = parseInt(row.uid, 10);
	if (!uid) {
		await db.delete(TOKEN_PREFIX + token);
		return { ok: false, reason: 'invalid' };
	}

	try {
		const exists = await user.exists(uid);
		if (!exists) {
			await db.delete(TOKEN_PREFIX + token);
			return { ok: false, reason: 'user-gone' };
		}
		const now = Date.now();
		await user.setUserField(uid, 'lastonline', now);
		await db.sortedSetAdd('users:online', now, uid);
		await db.delete(TOKEN_PREFIX + token);
		await db.sortedSetRemove(UID_TOKEN_KEY + uid, token);
		await audit.record({ uid, action: 'keepalive_used' });
		return { ok: true, uid };
	} catch (err) {
		winston.warn('[plugin/account-retention] keepalive consume failed uid=' + uid + ': ' + err.message);
		return { ok: false, reason: 'error' };
	}
};

exports.invalidateForUid = async (uid) => {
	const tokens = await db.getSortedSetRange(UID_TOKEN_KEY + uid, 0, -1);
	for (const t of tokens || []) {
		await db.delete(TOKEN_PREFIX + t);
	}
	await db.delete(UID_TOKEN_KEY + uid);
};
