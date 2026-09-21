# PostgreSQL and Supabase schema

The durable Aperture schema is assembled from the core migrations in
`supabase/migrations` and plugin-owned migrations in
`packages/*/migrations`. `@aperture/database` discovers both locations and
orders every migration by its 14-digit UTC version prefix. Adding a plugin
therefore does not require editing a central migration list.

Every personal-data table has a UUID primary key, an `owner_id`, UTC creation
and update timestamps, a nullable soft-delete timestamp, a monotonically
increasing record version, owner/date indexes, and owner-based Row Level
Security. Domain migrations add typed date, timestamp, `NUMERIC`, currency,
status, relationship, uniqueness, and range constraints. Cross-table foreign
keys include the owner so one owner cannot attach a record to another owner's
data.

The RLS helper reads the authenticated owner UUID from
`request.jwt.claim.sub`. The Phase 30 security migration grants personal-table
access to the `authenticated` role, revokes it from `anon` and `public`, and
limits the owner helper to authenticated sessions. Public self-registration is
disabled in `config.toml`; deployed Supabase projects must apply the same Auth
setting.

The local API configuration exposes `education`, `health`, and `finance` in
addition to `public`. These schemas are reachable only through their explicit
role grants and owner RLS policies. Platform, Planner, credential, and migration
schemas are not exposed by Phase 31.

Run the schema suite from the repository root:

```sh
npm test --workspace @aperture/database
```

The suite validates discovery and ordering, destructive-statement guards,
empty-database application, upgrade from the prior core state, schema
invariants, relationship constraints, and the seed. It uses PGlite and never
connects to a remote database.

`seed.sql` contains a single clearly labelled synthetic owner and preferences
record for local development. Production data and credentials do not belong in
seed files.
