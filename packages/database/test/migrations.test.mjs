import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { discoverMigrations } from "../src/migration-discovery.mjs";

async function apply(db, migrations) {
  for (const migration of migrations) {
    await db.exec(migration.sql);
  }
}

test("discovers core and plugin-owned migrations without a central manifest", async () => {
  const migrations = await discoverMigrations();

  assert.deepEqual(
    migrations.map(({ scope }) => scope),
    ["core", "education", "health", "finance", "platform-contracts", "postgres-repositories", "core", "planner"],
  );
  assert.equal(new Set(migrations.map(({ version }) => version)).size, migrations.length);
  assert.deepEqual(
    [...migrations].sort((left, right) => left.version.localeCompare(right.version)),
    migrations,
  );

  const temporary = await mkdtemp(join(tmpdir(), "aperture-migrations-"));
  try {
    await mkdir(join(temporary, "supabase", "migrations"), { recursive: true });
    await mkdir(join(temporary, "packages", "new-plugin", "migrations"), { recursive: true });
    await writeFile(
      join(temporary, "supabase", "migrations", "20260101000000_core.sql"),
      "select 1;\n",
    );
    await writeFile(
      join(temporary, "packages", "new-plugin", "migrations", "20260101000001_plugin.sql"),
      "select 2;\n",
    );

    const discovered = await discoverMigrations(temporary);
    assert.deepEqual(discovered.map(({ scope }) => scope), ["core", "new-plugin"]);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("keeps every migration ordered, transactional, and roll-forward only", async () => {
  const migrations = await discoverMigrations();

  for (const migration of migrations) {
    assert.match(migration.sql, /^begin;/i, migration.path);
    assert.match(migration.sql, /commit;\s*$/i, migration.path);
    assert.doesNotMatch(
      migration.sql,
      /\b(drop\s+(table|schema)|truncate|delete\s+from)\b/i,
      migration.path,
    );
    assert.match(migration.sql, /insert into platform\.migration_audit/i, migration.path);
  }
});

test("applies from an empty PostgreSQL database with types, constraints, indexes, and RLS", async () => {
  const db = new PGlite();
  try {
    await apply(db, await discoverMigrations());

    const tables = await db.query(
      "select table_schema, table_name from information_schema.tables where table_schema in ('education','health','finance','platform','planner') order by 1, 2",
    );
    assert.equal(tables.rows.length, 75);

    const policies = await db.query(
      "select count(*)::int as count from pg_policies where schemaname in ('education','health','finance','platform','planner')",
    );
    assert.equal(policies.rows[0]?.count, 74);

    const rowSecurity = await db.query(
      "select count(*)::int as count from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('education','health','finance','platform','planner') and c.relkind = 'r' and c.relrowsecurity",
    );
    assert.equal(rowSecurity.rows[0]?.count, 74);

    const foreignKeys = await db.query(
      "select count(*)::int as count from pg_constraint where contype = 'f' and connamespace in (select oid from pg_namespace where nspname in ('education','health','finance','platform','planner'))",
    );
    assert.ok((foreignKeys.rows[0]?.count ?? 0) >= 35);

    const numericColumns = await db.query(
      "select count(*)::int as count from information_schema.columns where table_schema in ('education','health','finance','platform','planner') and data_type = 'numeric'",
    );
    assert.ok((numericColumns.rows[0]?.count ?? 0) >= 50);

    const timestampColumns = await db.query(
      "select count(*)::int as count from information_schema.columns where table_schema in ('education','health','finance','platform','planner') and data_type = 'timestamp with time zone'",
    );
    assert.ok((timestampColumns.rows[0]?.count ?? 0) >= 150);

    const missingBaseColumns = await db.query(`
      with personal_tables as (
        select table_schema, table_name
        from information_schema.tables
        where table_schema in ('education','health','finance','platform','planner')
          and not (table_schema = 'platform' and table_name = 'migration_audit')
      )
      select table_schema, table_name
      from personal_tables t
      where not exists (
        select 1 from information_schema.columns c
        where c.table_schema = t.table_schema and c.table_name = t.table_name
          and c.column_name = 'id' and c.data_type = 'uuid'
      ) or not exists (
        select 1 from information_schema.columns c
        where c.table_schema = t.table_schema and c.table_name = t.table_name
          and c.column_name = 'owner_id' and c.data_type = 'uuid'
      ) or not exists (
        select 1 from information_schema.columns c
        where c.table_schema = t.table_schema and c.table_name = t.table_name
          and c.column_name = 'deleted_at' and c.data_type = 'timestamp with time zone'
      ) or not exists (
        select 1 from information_schema.columns c
        where c.table_schema = t.table_schema and c.table_name = t.table_name
          and c.column_name = 'record_version' and c.data_type = 'bigint'
      )
    `);
    assert.deepEqual(missingBaseColumns.rows, []);
  } finally {
    await db.close();
  }
});

test("applies remaining migrations from the previous core state", async () => {
  const migrations = await discoverMigrations();
  const db = new PGlite();
  try {
    await apply(db, migrations.slice(0, 1));
    assert.equal(
      (await db.query("select count(*)::int as count from platform.migration_audit")).rows[0]
        ?.count,
      1,
    );

    await apply(db, migrations.slice(1));
    assert.equal(
      (await db.query("select count(*)::int as count from platform.migration_audit")).rows[0]
        ?.count,
      migrations.length,
    );
  } finally {
    await db.close();
  }
});

test("enforces owner-preserving relationships, currencies, and decimal checks", async () => {
  const db = new PGlite();
  try {
    await apply(db, await discoverMigrations());
    const ownerA = "10000000-0000-4000-8000-000000000001";
    const ownerB = "20000000-0000-4000-8000-000000000001";
    const institution = "30000000-0000-4000-8000-000000000001";

    await db.query(
      "insert into education.institutions (id, owner_id, name) values ($1, $2, 'Synthetic university')",
      [institution, ownerA],
    );
    await assert.rejects(
      db.query(
        "insert into education.programs (id, owner_id, institution_id, name) values ('40000000-0000-4000-8000-000000000001', $1, $2, 'Cross-owner program')",
        [ownerB, institution],
      ),
    );
    await db.query(
      "insert into education.programs (id, owner_id, institution_id, name) values ('40000000-0000-4000-8000-000000000002', $1, $2, 'Owned program')",
      [ownerA, institution],
    );
    await assert.rejects(
      db.query(
        "insert into finance.accounts (id, owner_id, name, account_type, currency) values ('50000000-0000-4000-8000-000000000001', $1, 'Bad currency', 'bank', 'usd')",
        [ownerA],
      ),
    );
    await assert.rejects(
      db.query(
        "insert into health.hydration_entries (id, owner_id, volume_milliliters, consumed_at) values ('60000000-0000-4000-8000-000000000001', $1, -1, now())",
        [ownerA],
      ),
    );
  } finally {
    await db.close();
  }
});

test("loads only the documented synthetic development seed", async () => {
  const db = new PGlite();
  try {
    await apply(db, await discoverMigrations());
    const seed = await readFile(join(process.cwd(), "..", "..", "supabase", "seed.sql"), "utf8");
    await db.exec(seed);

    const result = await db.query(
      "select p.email, p.display_name, s.time_zone, s.currency from platform.user_profiles p join platform.user_preferences s on s.owner_id = p.owner_id",
    );
    assert.deepEqual(result.rows, [
      {
        email: "synthetic-owner@example.invalid",
        display_name: "Synthetic Owner",
        time_zone: "UTC",
        currency: "USD",
      },
    ]);
  } finally {
    await db.close();
  }
});

test("enforces authenticated owner RLS and denies anonymous and cross-owner access", async () => {
  const db = new PGlite();
  try {
    await apply(db, await discoverMigrations());
    const ownerA = "10000000-0000-4000-8000-000000000001";
    const ownerB = "20000000-0000-4000-8000-000000000001";
    await db.query(
      "insert into education.institutions (id, owner_id, name, status, payload) values ('30000000-0000-4000-8000-000000000001', $1, 'Owner A', 'active', $2::jsonb), ('30000000-0000-4000-8000-000000000002', $3, 'Owner B', 'active', $4::jsonb)",
      [ownerA, JSON.stringify({ ownerId: ownerA }), ownerB, JSON.stringify({ ownerId: ownerB })],
    );

    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [ownerA]);
    assert.equal((await db.query("select count(*)::int as count from education.institutions")).rows[0]?.count, 1);
    await assert.rejects(db.query(
      "insert into education.institutions (id, owner_id, name, status) values ('30000000-0000-4000-8000-000000000003', $1, 'Cross owner', 'active')",
      [ownerB],
    ));

    await db.query("select set_config('request.jwt.claim.sub', '', false)");
    assert.equal((await db.query("select count(*)::int as count from education.institutions")).rows[0]?.count, 0);
    await db.exec("reset role");
    await db.exec("set role anon");
    await assert.rejects(db.query("select * from education.institutions"));
    await db.exec("reset role");
  } finally {
    await db.close();
  }
});
