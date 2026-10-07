# Aperture backup and recovery

Aperture exports personal feature data as a versioned JSON document. Every archive contains its owner, export time, feature schema versions, unit context, record count, and deterministic integrity checksum. Money remains in the domain's exact decimal string representation. Timestamps use ISO 8601 UTC strings and measurements keep their units in each record.

## Privacy

Exports are plaintext and contain sensitive personal, health, education, and financial data. Store them in an encrypted device or vault, avoid email and shared folders, and delete copies that are no longer required. Archives contain sanitized integration status at most; authentication sessions, OAuth tokens, refresh tokens, API keys, and `platform.integration_credentials` are never registered as export collections. Restoring Settings disconnects integrations, so reconnect them after recovery.

## Recovery workflow

1. Keep the original export unchanged. Copy it before attempting recovery.
2. Validate the JSON shape, schema versions, owner, feature payloads, and checksum.
3. Run a dry-run in `merge` or `replace` mode. Review additions, conflicts, replacements, and deletions.
4. Resolve every merge conflict, or use the exact confirmation produced by the dry-run for a replacement.
5. Restore through a server-side `createPostgresBackupService` instance. It revalidates the preview and applies all feature changes in one database transaction.
6. Export again and validate the new archive before removing the recovery copy.

An unsupported future archive or feature schema is rejected without mutation. Version 1 archives migrate to the current envelope during validation. Extra envelope fields are ignored so additive future metadata is safe. A failed transactional restore rolls back all mutations.

Data deletion follows the same pattern: run `dryRunDeletion`, review the owner, feature list, and record count, then submit the exact confirmation to `deleteData`. Deletion runs in one transaction.
