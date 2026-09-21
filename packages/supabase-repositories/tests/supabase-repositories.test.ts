import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  createPreviewRepositorySet,
  createSupabaseRepositorySet,
  createSupabaseSqlExecutor,
  type CloudSynchronizationSnapshot,
} from "../src/index.js";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_OWNER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ID = "00000000-0000-4000-8000-000000000101";
const CREATED_AT = "2040-01-01T08:00:00.000Z";

interface FakeResponse {
  readonly data: unknown;
  readonly error: Readonly<Record<string, unknown>> | null;
  readonly status?: number;
}

interface FakeStore {
  readonly tables: Map<string, Array<Record<string, unknown>>>;
  failuresRemaining: number;
  returnedFailuresRemaining: number;
  failAfterNextInsert: boolean;
  failAfterNextUpdate: boolean;
  calls: number;
}

class FakeQuery implements PromiseLike<FakeResponse> {
  readonly #filters: Array<readonly ["eq" | "is", string, unknown]> = [];
  #selection = "*";
  #range: readonly [number, number] | undefined;

  public constructor(private readonly runQuery: (filters: readonly (readonly ["eq" | "is", string, unknown])[], selection: string, range?: readonly [number, number]) => Promise<FakeResponse>) {}
  public eq(column: string, value: unknown): FakeQuery { this.#filters.push(["eq", column, value]); return this; }
  public is(column: string, value: null): FakeQuery { this.#filters.push(["is", column, value]); return this; }
  public select(columns: string): FakeQuery { this.#selection = columns; return this; }
  public range(from: number, to: number): FakeQuery { this.#range = [from, to]; return this; }
  public then<TResult1 = FakeResponse, TResult2 = never>(
    onfulfilled?: ((value: FakeResponse) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.runQuery(this.#filters, this.#selection, this.#range).then(onfulfilled, onrejected);
  }
}

function clone<T>(value: T): T { return structuredClone(value); }

function matches(row: Readonly<Record<string, unknown>>, filters: readonly (readonly ["eq" | "is", string, unknown])[]): boolean {
  return filters.every(([kind, column, value]) => kind === "is" ? row[column] === value : row[column] === value);
}

function fakeClient(store: FakeStore, authenticatedOwner = OWNER): SupabaseClient {
  return {
    schema(schema: string) {
      return {
        from(table: string) {
          const key = `${schema}.${table}`;
          const rows = () => store.tables.get(key) ?? [];
          const run = async (operation: () => FakeResponse): Promise<FakeResponse> => {
            store.calls += 1;
            if (store.failuresRemaining > 0) {
              store.failuresRemaining -= 1;
              throw new TypeError("Network unavailable");
            }
            if (store.returnedFailuresRemaining > 0) {
              store.returnedFailuresRemaining -= 1;
              return { data: null, error: { code: "", message: "TypeError: Failed to fetch" }, status: 0 };
            }
            return operation();
          };
          return {
            insert(value: Readonly<Record<string, unknown>>) {
              return new FakeQuery(async () => run(() => {
                if (value.owner_id !== authenticatedOwner) return { data: null, error: { code: "42501", message: "RLS denied" }, status: 403 };
                const current = rows();
                if (current.some((row) => row.id === value.id)) return { data: null, error: { code: "23505", message: "duplicate" }, status: 409 };
                const inserted = { ...clone(value), record_version: 1, deleted_at: null };
                store.tables.set(key, [...current, inserted]);
                if (store.failAfterNextInsert) {
                  store.failAfterNextInsert = false;
                  throw new TypeError("Response lost after commit");
                }
                return { data: [{ id: value.id }], error: null, status: 201 };
              }));
            },
            update(value: Readonly<Record<string, unknown>>) {
              return new FakeQuery(async (filters) => run(() => {
                const changed: Record<string, unknown>[] = [];
                const next = rows().map((row) => {
                  if (row.owner_id !== authenticatedOwner || !matches(row, filters)) return row;
                  const updated = { ...row, ...clone(value), record_version: Number(row.record_version) + 1 };
                  changed.push(updated);
                  return updated;
                });
                store.tables.set(key, next);
                if (store.failAfterNextUpdate) {
                  store.failAfterNextUpdate = false;
                  throw new TypeError("Response lost after commit");
                }
                return { data: changed.map((row) => ({ id: row.id })), error: null, status: 200 };
              }));
            },
            select(_columns: string) {
              return new FakeQuery(async (filters, _selection, range) => run(() => ({
                data: rows()
                  .filter((row) => row.owner_id === authenticatedOwner && matches(row, filters))
                  .slice(range?.[0] ?? 0, range === undefined ? undefined : range[1] + 1)
                  .map(clone),
                error: null,
                status: 200,
              })));
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;
}

function emptyStore(): FakeStore {
  return { tables: new Map(), failuresRemaining: 0, returnedFailuresRemaining: 0, failAfterNextInsert: false, failAfterNextUpdate: false, calls: 0 };
}

const institution = {
  id: ID,
  ownerId: OWNER,
  name: "Shared Academy",
  type: "university" as const,
  status: "active" as const,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};

describe("Supabase durable repository composition", () => {
  it("shares owner-scoped durable data across independent web and mobile compositions", async () => {
    const store = emptyStore();
    const web = createSupabaseRepositorySet(fakeClient(store));
    const mobile = createSupabaseRepositorySet(fakeClient(store));
    await web.education.institutions.create(institution);
    expect(await mobile.education.institutions.findById(ID, OWNER)).toEqual(institution);
    expect(await mobile.education.institutions.findById(ID, OTHER_OWNER)).toBeNull();
    expect(web.synchronization.getSnapshot("education").state).toBe("synchronized");
  });

  it("uses a committed record as proof after a lost create response without writing a duplicate", async () => {
    const store = emptyStore();
    store.failAfterNextInsert = true;
    const repositories = createSupabaseRepositorySet(fakeClient(store), { executor: { retryDelayMilliseconds: 0 } });
    await expect(repositories.education.institutions.create(institution)).resolves.toEqual(institution);
    expect(store.tables.get("education.institutions")).toHaveLength(1);
  });

  it("confirms ambiguous updates and deletes without applying either mutation twice", async () => {
    const store = emptyStore();
    const repositories = createSupabaseRepositorySet(fakeClient(store), { executor: { retryDelayMilliseconds: 0 } });
    await repositories.education.institutions.create(institution);
    store.failAfterNextUpdate = true;
    const updated = { ...institution, name: "Updated Academy", updatedAt: "2040-01-01T09:00:00.000Z" };
    await expect(repositories.education.institutions.update(updated)).resolves.toEqual(updated);
    expect(store.tables.get("education.institutions")?.[0]?.record_version).toBe(2);
    store.failAfterNextUpdate = true;
    await expect(repositories.education.institutions.delete(ID, OWNER)).resolves.toBeUndefined();
    expect(store.tables.get("education.institutions")).toHaveLength(1);
    expect(await repositories.education.institutions.findById(ID, OWNER)).toBeNull();
  });

  it("preserves duplicate detection when the provider returns a definitive conflict", async () => {
    const repositories = createSupabaseRepositorySet(fakeClient(emptyStore()));
    await repositories.education.institutions.create(institution);
    await expect(repositories.education.institutions.create(institution)).rejects.toMatchObject({ code: "postgres-duplicate-record" });
  });

  it("bounds retries, reports failed synchronization, and never fabricates read success", async () => {
    const store = emptyStore();
    store.failuresRemaining = 10;
    const sleep = vi.fn(async () => undefined);
    const executor = createSupabaseSqlExecutor(fakeClient(store), { maxRetries: 2, retryDelayMilliseconds: 1, sleep });
    const snapshots: CloudSynchronizationSnapshot[] = [];
    executor.monitor.subscribe((snapshot) => snapshots.push(snapshot));
    await expect(executor.query("select payload, record_version, updated_at from education.institutions where owner_id = $1 and deleted_at is null", [OWNER])).rejects.toBeInstanceOf(TypeError);
    expect(store.calls).toBe(3);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(executor.monitor.getSnapshot("education")).toMatchObject({ state: "failed", inFlight: 0, attempt: 3 });
    expect(snapshots.map((snapshot) => snapshot.state)).toEqual(["synchronizing", "synchronizing", "synchronizing", "failed"]);
  });

  it("retries provider-returned fetch failures as well as thrown network errors", async () => {
    const store = emptyStore();
    store.returnedFailuresRemaining = 2;
    const executor = createSupabaseSqlExecutor(fakeClient(store), { retryDelayMilliseconds: 0 });
    await expect(executor.query("select payload, record_version, updated_at from education.institutions where owner_id = $1 and deleted_at is null", [OWNER])).resolves.toEqual({ rows: [] });
    expect(store.calls).toBe(3);
    expect(executor.monitor.getSnapshot("education").state).toBe("synchronized");
  });

  it("reads every provider page instead of accepting the REST row limit as a complete result", async () => {
    const store = emptyStore();
    store.tables.set("education.institutions", Array.from({ length: 1_001 }, (_, index) => ({
      id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      owner_id: OWNER,
      payload: { index },
      record_version: 1,
      updated_at: CREATED_AT,
      deleted_at: null,
    })));
    const executor = createSupabaseSqlExecutor(fakeClient(store));
    const result = await executor.query("select payload, record_version, updated_at from education.institutions where owner_id = $1 and deleted_at is null", [OWNER]);
    expect(result.rows).toHaveLength(1_001);
    expect(store.calls).toBe(2);
  });

  it("keeps isolated memory composition for tests and explicit previews", async () => {
    const first = createPreviewRepositorySet();
    const second = createPreviewRepositorySet();
    await first.education.institutions.create(institution);
    expect(await second.education.institutions.findById(ID, OWNER)).toBeNull();
  });
});
