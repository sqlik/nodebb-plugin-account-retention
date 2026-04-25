# nodebb-plugin-account-retention

GDPR-friendly inactive account retention for NodeBB.

Automatically deletes user accounts that have been inactive (no login) for a configurable period — default **365 days**. Posts and topics are preserved (NodeBB's native `User.deleteAccount` reassigns content to a guest placeholder), only the user record and personal data are removed.

## Why

Article 5(1)(e) of the GDPR requires personal data to be kept "no longer than is necessary for the purposes for which it is processed". For a discussion forum, that typically means inactive accounts must be retired after a defined period documented in your privacy policy. NodeBB has no built-in mechanism for this — this plugin fills that gap.

## Features

- **Configurable inactivity window** — default 365 days, set in ACP.
- **Escalating warning emails** — default 30 days and 7 days before deletion, plus a final notification at deletion time. Schedule fully configurable.
- **One-click keep-alive link** in every warning email — user can reset the inactivity counter without logging in (good UX, also a clean record of explicit consent to remain).
- **Exclusions** — administrators and global moderators are always excluded; additional UIDs can be exempted manually in ACP.
- **Banned-user policy** — toggle whether banned users are eligible for deletion (default: yes — they are inactive by definition).
- **Never-logged-in fallback** — uses `max(lastonline, joindate)` so registered-but-never-active accounts aren't deleted on day one.
- **Dry-run mode** — runs the full pipeline (including email sends optional) without actually deleting anything; produces the same audit log so you can see exactly what would happen.
- **ACP preview** — see every user pending action and their scheduled date before flipping the switch.
- **Audit log** — every notification and deletion is recorded with a hashed email and timestamp; needed to demonstrate compliance to your DPA / regulator.
- **Resilient catch-up** — if the forum was offline past a warning window, the plugin sends one consolidated final warning instead of skipping to deletion.
- **i18n** — Polish and English bundled.

## Installation

```bash
cd /path/to/nodebb
npm install nodebb-plugin-account-retention
```

Then activate via ACP → Extend → Plugins, restart NodeBB and configure under **Admin → Plugins → Account Retention**.

## Recommended rollout

1. Install with `enabled = false`, `dryRun = true`.
2. Set the inactivity window matching your privacy policy (e.g. 365 days).
3. Open the **Pending** tab in ACP — review the list of users that would be touched on the next run.
4. If the list looks right, enable the plugin (still in dry-run). Wait 24–48h, review the audit log to confirm the cron is firing as expected.
5. Send a forum-wide announcement explaining the new retention policy (good practice, not strictly required if your privacy policy already covers it).
6. Disable dry-run.

## License

MIT — Tomasz Sawko / sqlik
