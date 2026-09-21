# Durable repository adapters

Phase 29 adds PostgreSQL implementations for all Education, Health, and Finance
repository contracts. Domain services keep their existing interfaces; storage
selection happens through `createRepositorySet` in the composition root.

## Data mapping

Each adapter writes the complete validated domain entity to the table's JSONB
payload. A projection writes the same record's searchable and constrained
values to typed columns. This preserves decimal strings and nested domain data
without exposing PostgreSQL result types to feature code, while PostgreSQL can
still enforce UUID relationships, currency formats, date ranges, numeric
bounds, uniqueness, and owner ownership.

Reads parse the JSONB payload with the corresponding domain schema. A malformed
or obsolete row produces a structured `PostgresRepositoryError` instead of
partially mapped data. PostgreSQL duplicate, foreign-key, check, and storage
failures are also translated into stable error codes.

## Isolation and pagination

Every operation includes `owner_id`, even before Row Level Security evaluates
the request. Related rows use `(owner_id, id)` foreign keys. Soft-deleted rows
are excluded from reads.

List operations use the exact match and ordering behavior of the established
memory adapters. Their opaque cursor records the table, owner, normalized
query, offset, and a snapshot of row versions. Cursors cannot be reused for a
different owner or filter, and a mutation makes an outstanding cursor stale.

## Transactions and composition

`runInPostgresTransaction` creates all three repository aggregates over one
database transaction and returns only after commit. An exception rolls the full
operation back. `createRepositorySet({ mode: "memory" })` and
`createRepositorySet({ mode: "postgres", database })` expose the same domain
contracts, so tests and explicit previews can remain in memory without changing
services.

Integration tests run the complete discovered migration stream in disposable
PGlite databases. They cover all 62 aggregate repositories plus Health profile
and equipment-usage behavior, owner isolation, soft delete, decimal fidelity,
date filtering, pagination invalidation, cross-record constraints, transaction
rollback, persistent state across adapter instances, and defensive mapping.
