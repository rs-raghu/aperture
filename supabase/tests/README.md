# Database verification

Executable schema and migration coverage lives in
`packages/database/test/migrations.test.mjs`. The tests create disposable local
PostgreSQL databases, apply the same discovered migration stream used by the
application, and verify RLS, shared columns, typed values, constraints,
owner-preserving foreign keys, upgrade ordering, and synthetic seed data.

No test in this directory connects to or mutates a remote Supabase project.
