# PostgreSQL repositories

`@aperture/postgres-repositories` implements every Education, Health, and
Finance repository contract against the Phase 28 PostgreSQL schema.

The adapter accepts a small parameterized `SqlExecutor` interface. This keeps
PGlite, PostgreSQL pool, and server-side Supabase connection types outside the
domain packages. `createRepositorySet` selects memory or PostgreSQL adapters at
the composition boundary, while feature services continue to depend on the
same domain repository contracts.

All writes persist the validated domain entity in JSONB and project relational
keys, query dates, currency codes, decimal strings, measurements, and statuses
into typed PostgreSQL columns. Reads validate the JSON payload before returning
it. Delete operations use tombstones so synchronization versions remain
observable.

`runInPostgresTransaction` supplies all three aggregate repositories on one
database transaction. Use it when one operation must update multiple records.

Run the isolated integration suite with:

```sh
npm test --workspace @aperture/postgres-repositories
```
