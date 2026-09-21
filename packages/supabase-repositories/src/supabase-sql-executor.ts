import type { SupabaseClient } from "@supabase/supabase-js";
import type { SqlExecutor, SqlQueryResult } from "@aperture/postgres-repositories";

import {
  CloudSynchronizationMonitor,
  type CloudSynchronizationScope,
} from "./synchronization-monitor.js";

interface ProviderError {
  readonly code?: string;
  readonly message?: string;
  readonly status?: number;
}

interface ProviderResult {
  readonly data: unknown;
  readonly error: ProviderError | null;
  readonly status?: number;
}

interface ProviderQuery extends PromiseLike<ProviderResult> {
  eq(column: string, value: unknown): ProviderQuery;
  is(column: string, value: null): ProviderQuery;
  select(columns: string): ProviderQuery;
  range(from: number, to: number): ProviderQuery;
}

interface ProviderTable {
  insert(value: Readonly<Record<string, unknown>>): ProviderQuery;
  update(value: Readonly<Record<string, unknown>>): ProviderQuery;
  select(columns: string): ProviderQuery;
}

interface ProviderClient {
  schema(name: string): { from(table: string): ProviderTable };
}

export interface SupabaseExecutorConfiguration {
  readonly maxRetries?: number;
  readonly retryDelayMilliseconds?: number;
  readonly sleep?: (milliseconds: number) => Promise<void>;
  readonly monitor?: CloudSynchronizationMonitor;
}

interface QualifiedTable {
  readonly schema: CloudSynchronizationScope;
  readonly table: string;
}

interface ParsedInsert extends QualifiedTable {
  readonly kind: "insert";
  readonly columns: readonly string[];
}

interface ParsedUpdate extends QualifiedTable {
  readonly kind: "update";
  readonly assignments: readonly { readonly column: string; readonly parameter: number }[];
}

interface ParsedDelete extends QualifiedTable {
  readonly kind: "delete";
}

interface ParsedSelect extends QualifiedTable {
  readonly kind: "select";
  readonly byId: boolean;
}

type ParsedStatement = ParsedInsert | ParsedUpdate | ParsedDelete | ParsedSelect;

const IDENTIFIER = "[a-z][a-z0-9_]*";
const PERSONAL_SCHEMAS = new Set<CloudSynchronizationScope>(["education", "health", "finance"]);

function parseQualified(schema: string, table: string): QualifiedTable {
  if (!PERSONAL_SCHEMAS.has(schema as CloudSynchronizationScope)) {
    throw Object.assign(new Error("The Supabase executor received an unsupported schema."), { code: "PGRST106" });
  }
  return { schema: schema as CloudSynchronizationScope, table };
}

function parseStatement(sql: string): ParsedStatement {
  const normalized = sql.trim().replace(/\s+/g, " ");
  const insert = new RegExp(`^insert into (${IDENTIFIER})\\.(${IDENTIFIER}) \\(([^)]+)\\) values \\(.+\\)$`, "i").exec(normalized);
  if (insert !== null) {
    return {
      kind: "insert",
      ...parseQualified(insert[1]!.toLowerCase(), insert[2]!.toLowerCase()),
      columns: insert[3]!.split(",").map((column) => column.trim()),
    };
  }
  const deleted = new RegExp(`^update (${IDENTIFIER})\\.(${IDENTIFIER}) set deleted_at = statement_timestamp\\(\\) where id = \\$1 and owner_id = \\$2 and deleted_at is null returning id$`, "i").exec(normalized);
  if (deleted !== null) return { kind: "delete", ...parseQualified(deleted[1]!.toLowerCase(), deleted[2]!.toLowerCase()) };
  const update = new RegExp(`^update (${IDENTIFIER})\\.(${IDENTIFIER}) set (.+) where id = \\$3 and owner_id = \\$4 and created_at = \\$5::timestamptz and deleted_at is null returning id$`, "i").exec(normalized);
  if (update !== null) {
    const assignments = update[3]!.split(",").map((assignment) => {
      const match = new RegExp(`^(${IDENTIFIER}) = \\$(\\d+)(?:::[a-z0-9_]+)?$`, "i").exec(assignment.trim());
      if (match === null) throw Object.assign(new Error("The Supabase executor received an unsupported update."), { code: "PGRST100" });
      return { column: match[1]!, parameter: Number(match[2]!) - 1 };
    });
    return { kind: "update", ...parseQualified(update[1]!.toLowerCase(), update[2]!.toLowerCase()), assignments };
  }
  const select = new RegExp(`^select payload, record_version, updated_at from (${IDENTIFIER})\\.(${IDENTIFIER}) where (id = \\$1 and )?owner_id = \\$(?:1|2) and deleted_at is null$`, "i").exec(normalized);
  if (select !== null) {
    return { kind: "select", ...parseQualified(select[1]!.toLowerCase(), select[2]!.toLowerCase()), byId: select[3] !== undefined };
  }
  throw Object.assign(new Error("The Supabase executor received an unsupported SQL statement."), { code: "PGRST100" });
}

function parsePayload(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function toRows(value: unknown): readonly Record<string, unknown>[] {
  if (Array.isArray(value)) return value as readonly Record<string, unknown>[];
  if (typeof value === "object" && value !== null) return [value as Record<string, unknown>];
  return [];
}

function providerException(error: ProviderError, status?: number): Error {
  return Object.assign(new Error(error.message ?? "The Supabase data request failed."), error, {
    ...(error.status === undefined && status !== undefined ? { status } : {}),
  });
}

function errorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) return String((error as { readonly code?: unknown }).code);
  return error instanceof Error ? error.name : "supabase-network-failure";
}

function isRetryable(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (typeof error !== "object" || error === null) return false;
  const status = "status" in error ? Number((error as { readonly status?: unknown }).status) : 0;
  const code = "code" in error ? String((error as { readonly code?: unknown }).code) : "";
  const message = "message" in error ? String((error as { readonly message?: unknown }).message).toLowerCase() : "";
  return status === 408 || status === 429 || status >= 500 ||
    ["PGRST000", "PGRST002", "PGRST003"].includes(code) ||
    (status === 0 && /fetch|network|timeout|connection/.test(message));
}

function samePayload(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export interface SupabaseSqlExecutor extends SqlExecutor {
  readonly monitor: CloudSynchronizationMonitor;
}

export function createSupabaseSqlExecutor(
  supabaseClient: SupabaseClient | ProviderClient,
  configuration: SupabaseExecutorConfiguration = {},
): SupabaseSqlExecutor {
  const client = supabaseClient as unknown as ProviderClient;
  const maxRetries = configuration.maxRetries ?? 2;
  if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > 5) {
    throw new RangeError("Supabase repository retries must be an integer from zero through five.");
  }
  const retryDelay = configuration.retryDelayMilliseconds ?? 125;
  const sleep = configuration.sleep ?? ((milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  const monitor = configuration.monitor ?? new CloudSynchronizationMonitor();

  async function result(query: ProviderQuery): Promise<readonly Record<string, unknown>[]> {
    const response = await query;
    if (response.error !== null) throw providerException(response.error, response.status);
    return toRows(response.data);
  }

  function table(statement: QualifiedTable): ProviderTable {
    return client.schema(statement.schema).from(statement.table);
  }

  async function readAppliedRow(statement: QualifiedTable, id: unknown, ownerId: unknown): Promise<Record<string, unknown> | null> {
    try {
      const rows = await result(table(statement).select("payload,record_version,updated_at,deleted_at").eq("id", id).eq("owner_id", ownerId));
      return rows[0] ?? null;
    } catch {
      return null;
    }
  }

  async function executeOnce(statement: ParsedStatement, parameters: readonly unknown[]): Promise<readonly Record<string, unknown>[]> {
    if (statement.kind === "insert") {
      const row = Object.fromEntries(statement.columns.map((column, index) => [column, column === "payload" ? parsePayload(parameters[index]) : parameters[index]]));
      return result(table(statement).insert(row).select("id"));
    }
    if (statement.kind === "update") {
      const patch = Object.fromEntries(statement.assignments.map(({ column, parameter }) => [column, column === "payload" ? parsePayload(parameters[parameter]) : parameters[parameter]]));
      return result(table(statement).update(patch).eq("id", parameters[2]).eq("owner_id", parameters[3]).eq("created_at", parameters[4]).is("deleted_at", null).select("id"));
    }
    if (statement.kind === "delete") {
      return result(table(statement).update({ deleted_at: new Date().toISOString() }).eq("id", parameters[0]).eq("owner_id", parameters[1]).is("deleted_at", null).select("id"));
    }
    if (statement.byId) {
      return result(table(statement).select("payload,record_version,updated_at").eq("id", parameters[0]).eq("owner_id", parameters[1]).is("deleted_at", null));
    }
    const pageSize = 1_000;
    const rows: Record<string, unknown>[] = [];
    while (true) {
      const page = await result(
        table(statement)
          .select("payload,record_version,updated_at")
          .eq("owner_id", parameters[0])
          .is("deleted_at", null)
          .range(rows.length, rows.length + pageSize - 1),
      );
      rows.push(...page);
      if (page.length < pageSize) return rows;
    }
  }

  async function confirmsMutation(statement: ParsedInsert | ParsedUpdate | ParsedDelete, parameters: readonly unknown[]): Promise<boolean> {
    const id = statement.kind === "update" ? parameters[2] : parameters[0];
    const ownerId = statement.kind === "update" ? parameters[3] : parameters[1];
    const row = await readAppliedRow(statement, id, ownerId);
    if (row === null) return false;
    if (statement.kind === "delete") return row.deleted_at !== null && row.deleted_at !== undefined;
    const expected = parsePayload(statement.kind === "insert" ? parameters[2] : parameters[0]);
    return row.deleted_at === null && samePayload(row.payload, expected);
  }

  return Object.freeze({
    monitor,
    async query<TRow extends object = Record<string, unknown>>(
      sql: string,
      parameters: readonly unknown[] = [],
    ): Promise<SqlQueryResult<TRow>> {
      const statement = parseStatement(sql);
      monitor.begin(statement.schema);
      let attempt = 0;
      try {
        while (true) {
          attempt += 1;
          if (attempt > 1) monitor.retry(statement.schema, attempt);
          try {
            const rows = await executeOnce(statement, parameters);
            monitor.succeed(statement.schema);
            return { rows: rows as readonly TRow[] };
          } catch (error) {
            const canRetry = isRetryable(error) && attempt <= maxRetries;
            if (statement.kind !== "select" && isRetryable(error) && await confirmsMutation(statement, parameters)) {
              monitor.succeed(statement.schema);
              return { rows: [{ id: statement.kind === "update" ? parameters[2] : parameters[0] }] as unknown as readonly TRow[] };
            }
            if (!canRetry) throw error;
            await sleep(retryDelay * attempt);
          }
        }
      } catch (error) {
        monitor.fail(statement.schema, errorCode(error));
        throw error;
      }
    },
  });
}
