# Data backup and recovery

Phase 35 implements portable backup, validation, dry-run, conflict reporting, transactional restore, and reviewed deletion through `@aperture/backup`. Web and mobile expose Data & recovery screens for plaintext export and preflight inspection. Mutating restore and deletion stay on the server-side PostgreSQL boundary so a browser or mobile network failure cannot leave partial state. Durable Health exports include the separate equipment-usage collection with its original timestamps, measurements, and relationship identifiers. Volatile preview equipment-usage summaries are not durable archive records.

## Archive contract

An Aperture archive is JSON with `format: "aperture-backup"` and schema version 2. Its envelope records the backup ID, owner ID, UTC export timestamp, full or feature-scoped selection, explicit unit context, feature schema versions, total record count, privacy warning, and FNV-1a 64-bit integrity digest. The digest covers every field except the digest itself through deterministic key ordering.

Feature payloads contain owner-scoped domain records. Finance money and quantities retain the domain's decimal strings, so serialization does not pass through binary floating-point arithmetic. Domain timestamps remain ISO 8601 strings. Health measurements retain the unit attached to each value, and the archive repeats the owner's unit preferences as context.

The registered feature list is explicit: Education, Health, Finance, Planner, and Settings. Settings exports preferences and sanitized integration status. Authentication sessions, password material, OAuth access and refresh tokens, API keys, ciphertext, `platform.integration_credentials`, export-job rows, and backup-manifest rows are absent from every adapter.

## Validation and compatibility

Validation completes before a transaction starts. It checks JSON parsing, the format and supported envelope version, checksum, expected owner, known feature and collection names, duplicate IDs, timestamps, current feature schema versions, and every domain entity schema. Unknown future envelope versions and unregistered features are rejected without mutation. Unknown additive envelope fields are accepted when covered by the checksum. Version 1 archives migrate to the version 2 envelope in memory before preview.

A dry-run compares archive identities with durable owner records. It reports additions, replacements, deletions, duplicate archive records, and existing-record conflicts. Merge mode is blocked while conflicts remain. Replacement produces an exact confirmation bound to the owner, archive checksum, and current durable-record checksum. Deletion binds its confirmation to the owner, feature list, record count, and durable-record checksum. The mutation call must supply the authenticated owner again. Either operation rejects a preview for another owner or stale approval when records change after preview.

## Transactional mutation

`createPostgresBackupService` rebuilds feature adapters inside the supplied `TransactionalSqlExecutor`. Replacement purges only explicit allowlisted feature tables in foreign-key-safe reverse order, then recreates schema-validated records in dependency order. Any failure rolls the transaction back. Settings replacement removes server-held integration credentials and restores only sanitized connection status; integrations therefore require reconnection after recovery.

The browser and mobile compositions export through their owner-scoped repositories. Phase 38 adds reviewed restore and deletion through the authenticated `/api/recovery` Node API, backed by one PostgreSQL transaction. It requires `APERTURE_RECOVERY_ENABLED=true`, a server-only `DATABASE_URL`, the configured Supabase owner, and the owned web origin. Mobile supplies the verified Supabase bearer session to `EXPO_PUBLIC_APERTURE_WEB_URL`; browsers use their session cookie and an exact Origin check. With recovery disabled, export and local validation remain available and mutation controls stay unavailable.

The API accepts at most 8 MiB including its JSON envelope and rejects excessive nesting, unknown command fields, corrupt archives, and cross-owner records. Responses contain counts and confirmation text, never archive payloads or provider diagnostics. Every mutation recomputes its preview and checks exact confirmation and the current state fingerprint. Both merge and replacement require typed confirmation in this interface. Selected-feature deletion has a separate review and confirmation. Changing an archive or mode invalidates the pending review.

Recovery locks the registered feature tables in a deterministic order with a ten-second lock timeout before checking the state fingerprint and writing. This prevents a concurrent REST write from invalidating the preview inside the transaction. Locks can temporarily block normal writes; restore during a quiet period. Node transaction queries are serialized on their checked-out driver connection and drained before commit or rollback. An authenticated process limits recovery POST requests to 30 per minute; production edge limits remain necessary across multiple server instances. Export a new archive after recovery and reload open feature screens.

Feature-owned adapters can register through manifest `dataContributions.server` exports. Portfolio archives contain only curated private content; recovery clears publication snapshots. Credentials and publication status are never restored.

## Operator recovery procedure

1. Preserve the original archive and work from a copy.
2. Confirm the plaintext warning and store the archive in an encrypted device or vault.
3. Validate the checksum, owner, versions, feature schemas, and record count.
4. Run a merge or replacement dry-run and review every conflict, deletion, and replacement.
5. For replacement, submit the exact confirmation emitted by that dry-run to the transactional service.
6. Export again after restore, validate the new archive, and compare expected record counts.
7. Reconnect third-party integrations; credentials are intentionally never restored.
8. Delete temporary plaintext copies when recovery is verified.

For deletion, create and validate a recovery archive first, run `dryRunDeletion`, review its feature list and count, and submit its exact confirmation to `deleteData`. The entire deletion uses one database transaction.

## Verification

Core tests cover full and feature-scoped exports, exact money, privacy exclusions, synthetic round trips, merge conflicts, replacement confirmation, deletion confirmation, checksum corruption, owner mismatch, unsupported future versions, version 1 migration, unknown additive metadata, and rollback after a synthetic multi-feature failure. PGlite contract tests additionally exercise domain validation before mutation, backup metadata persistence, physical replacement of soft-deleted IDs, credential exclusion and removal, sanitized integration-status recovery, and exact Finance restoration.
