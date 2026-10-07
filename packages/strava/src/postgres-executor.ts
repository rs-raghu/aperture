import type { Pool, PoolClient } from "pg";
import type { SqlExecutor, TransactionalSqlExecutor } from "@aperture/postgres-repositories";

function executor(client: Pool | PoolClient): SqlExecutor {
  return { async query<TRow extends object>(sql: string, parameters: readonly unknown[] = []) { return { rows: (await client.query<TRow>(sql, [...parameters])).rows }; } };
}
export function createNodePostgresExecutor(pool: Pool): TransactionalSqlExecutor {
  return {
    ...executor(pool),
    async transaction(work) {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await work(executor(client));
        await client.query("commit");
        return result;
      } catch (error) { await client.query("rollback"); throw error; }
      finally { client.release(); }
    },
  };
}
