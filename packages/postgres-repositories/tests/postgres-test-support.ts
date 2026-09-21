import { readdir, readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PGlite, type PGliteInterface, type Transaction } from "@electric-sql/pglite";

import type { SqlExecutor, TransactionalSqlExecutor } from "../src/index.js";

const MIGRATION_NAME = /^\d{14}_[a-z0-9_]+\.sql$/;
const WORKSPACE_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

async function migrationFiles(directory: string): Promise<readonly string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && MIGRATION_NAME.test(entry.name))
      .map((entry) => resolve(directory, entry.name));
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function migrations(): Promise<readonly string[]> {
  const files = [...await migrationFiles(resolve(WORKSPACE_ROOT, "supabase", "migrations"))];
  const packageRoot = resolve(WORKSPACE_ROOT, "packages");
  for (const entry of await readdir(packageRoot, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      files.push(...await migrationFiles(resolve(packageRoot, entry.name, "migrations")));
    }
  }
  return files.sort((left, right) => basename(left).localeCompare(basename(right)));
}

function executor(client: PGliteInterface | Transaction): SqlExecutor {
  return {
    async query<TRow extends object>(sql: string, parameters: readonly unknown[] = []) {
      const result = await client.query<TRow>(sql, [...parameters]);
      return { rows: result.rows };
    },
  };
}

export async function createTestDatabase(): Promise<{
  readonly database: PGlite;
  readonly executor: TransactionalSqlExecutor;
}> {
  const database = new PGlite();
  for (const path of await migrations()) await database.exec(await readFile(path, "utf8"));
  return {
    database,
    executor: {
      ...executor(database),
      transaction: (work) => database.transaction((transaction) => work(executor(transaction))),
    },
  };
}

export const OWNER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const OWNER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export const CREATED_AT = "2040-01-01T08:00:00.000Z";
export const UPDATED_AT = "2040-01-01T09:00:00.000Z";

export function identifier(sequence: number): string {
  return `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`;
}
