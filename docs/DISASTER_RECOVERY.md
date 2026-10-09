# Backup, rollback, and disaster recovery

These procedures require the verified owner/target and preserve source migration history. Test recovery on an isolated database before relying on it for production data.

## Before deployment or a data change

1. Export an owner archive through Settings → Data & recovery, validate its checksum/counts, and store it encrypted in an owner-controlled vault. Plaintext archives contain sensitive records.
2. Take a provider database snapshot using the verified project's supported backup process. An owner archive excludes credentials, provider sessions, publication snapshots, and migration history; it cannot replace a full infrastructure backup.
3. Record the deployed commit, environment version, migration versions, domain, redirect allowlist, and expected feature counts privately. Never include key values or tokens in that record's public copy.
4. Preserve the Strava encryption key securely if retaining encrypted provider credentials. Loss of the key requires disconnect/reconnection; archives cannot recover tokens.

## Application rollback

Pause writes, identify the last working deployment and its compatibility with the current schema, then use the hosting provider's verified rollback/redeploy procedure. Keep migrations forward-only. Rolling back code does not roll back the database or OAuth secrets. If compatibility is uncertain, deploy a reviewed forward fix on an isolated copy first. Never erase migration history or run a remote reset as a shortcut.

Disable optional integration/publication flags while diagnosing. A disabled publication gate immediately removes the public Portfolio response; it does not delete its private draft. A recovery timeout can occur after the server commits: reload/export, inspect counts, and run a new preview before any retry. Do not assume a client timeout means rollback.

## Owner archive restore

1. Confirm the Supabase identity and fixed owner UUID match the archive; inspect the checksum, supported versions, collection validation, and expected count.
2. Choose merge for non-conflicting additions or replacement for an exact selected-feature restore. Replacement removes selected owner records; first preserve the current state with another archive.
3. Run the server preview and review conflicts, replacements, deletions, and the current fingerprint. Type the exact confirmation. Any source/mode/state change requires a fresh review.
4. Apply through one server PostgreSQL transaction, during a quiet period. Registered table locks may block other writes temporarily. Unknown/invalid records must fail before mutation; SQL failures roll back the transaction.
5. Export again and compare Finance precision, Health units, Education relationships, Planner items, and Settings. Reload open views and check both clients against the same durable state.
6. Reconnect integrations and explicitly re-review any curated publication; recovery restores neither credentials nor public status. Remove temporary plaintext copies after verification.

The app accepts up to 8 MiB per recovery envelope; the selected host can impose a lower request cap. A larger archive requires the same service on an owner-operated trusted host with a verified database connection, never unreviewed partial REST replacements.

## Full infrastructure loss

Restore the provider snapshot into a separately verified recovery project, compare schema/migration versions, apply only reviewed pending forward migrations, recreate restricted Auth settings/owner identity, and reconfigure the apps' endpoints and server secrets. Verify RLS/anonymous denial and all smoke tests before switching the domain or resuming writes. If only an owner archive survives, provision the schema and compatible owner identity first, then restore the validated archive transactionally. An archive for a different UUID must not be relabelled or rechecksummed to bypass ownership.

Recovery-point and recovery-time objectives depend on the owner's actual provider backup plan and archive cadence; no paid backup plan was selected or tested during implementation.
