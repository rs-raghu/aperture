// Node-only driver entry point. The client-safe root never imports this module.
import { Pool, type PoolClient } from "pg";
import { SUPABASE_DATABASE_CA } from "./supabase-ca.js";
import type { SqlExecutor, TransactionalSqlExecutor } from "./postgres.types.js";
export function createSecurePostgresPool(connectionString: string, max: number): Pool {
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !Number.isSafeInteger(max) || max < 1 || max > 10) throw new Error("Invalid PostgreSQL connection configuration.");
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
  const supabase = /^[a-z0-9-]+\.pooler\.supabase\.com$/.test(url.hostname) || /^db\.[a-z0-9]+\.supabase\.co$/.test(url.hostname);
  for (const name of ["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert", "sslnegotiation", "uselibpqcompat"]) url.searchParams.delete(name);
  return new Pool({ connectionString: url.toString(), ssl: local ? false : { rejectUnauthorized: true, ...(supabase ? { ca: SUPABASE_DATABASE_CA } : {}) }, max, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 30_000, statement_timeout: 20_000, query_timeout: 20_000 });
}
function scopedExecutor(client: PoolClient): SqlExecutor & { drain(): Promise<void> } {
  let pending = Promise.resolve();
  return {
    query<TRow extends object>(sql: string, parameters: readonly unknown[] = []) {
      const next = pending.then(async () => ({ rows: (await client.query<TRow>(sql, [...parameters])).rows }));
      // Every caller receives its own rejection; the queue still drains before rollback.
      pending = next.then(() => undefined, () => undefined); return next;
    },
    drain: () => pending,
  };
}
export function createNodePostgresExecutor(pool: Pool): TransactionalSqlExecutor {
  return {
    async query<TRow extends object>(sql: string, parameters: readonly unknown[] = []) { return { rows: (await pool.query<TRow>(sql, [...parameters])).rows }; },
    async transaction(work) {
      const client = await pool.connect(); const scoped = scopedExecutor(client);
      try { await client.query("begin"); const result = await work(scoped); await scoped.drain(); await client.query("commit"); return result; }
      catch (failure) { await scoped.drain(); await client.query("rollback"); throw failure; }
      finally { client.release(); }
    },
  };
}
