# Aperture database schema

Phase 28 introduces the durable PostgreSQL schema used by the Education,
Health, Finance, Planner, settings, calculator scenario, synchronization, and
integration boundaries.

## Migration ownership

Core infrastructure lives in `supabase/migrations`. Each domain can own SQL in
`packages/<domain>/migrations`; `@aperture/database` discovers those directories
at runtime and sorts all files by their 14-digit version prefix. Duplicate or
malformed versions fail before any SQL runs. There is no handwritten migration
registry to update when a package adds a migration.

The current sequence is:

1. Core schemas, migration audit, shared owner/RLS table helper, and update trigger.
2. Education records and relationships.
3. Health records and relationships.
4. Finance records, including calculator scenarios.
5. Settings, synchronization, integrations, exports, backups, and Planner.

Each file is transactional and records its version in
`platform.migration_audit`. The automated guard rejects destructive `DROP`,
`TRUNCATE`, and `DELETE FROM` statements so this migration series remains
roll-forward safe.

## Shared data rules

Every personal table includes:

- UUID `id` and `owner_id` columns
- UTC `created_at`, `updated_at`, and nullable `deleted_at` timestamps
- a positive `record_version` incremented on update
- a JSON object payload for lossless domain mapping
- a unique `(owner_id, id)` key for owner-preserving relationships
- owner/update and active-record indexes
- Row Level Security tied to the authenticated JWT subject

Domain columns add database validation and query support. Calendar concepts use
`date`; events use `timestamptz`; money and precision-sensitive values use
`NUMERIC`; currencies use checked three-letter uppercase codes. Foreign keys
carry `owner_id`, preventing a record from linking to another owner's row even
when its UUID is known.

## Local validation

`npm test --workspace @aperture/database` runs the production migration stream
against disposable PGlite PostgreSQL databases. It validates a fresh install,
an upgrade from the core migration, table invariants, RLS, typed columns,
relationships, constraints, ordering, and the synthetic development seed.

The migration workflow does not connect to a remote Supabase project. A remote
target must be identified and explicitly authorized before a destructive or
state-changing database command is run against it.
