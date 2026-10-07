import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { PGlite, type PGliteInterface, type Transaction } from "@electric-sql/pglite";
import { readdir, readFile } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createPostgresBackupService, type SqlExecutor, type TransactionalSqlExecutor } from "@aperture/postgres-repositories";
import { createStravaPostgresRepository, createStravaPostgresUnitOfWork, createStravaPostgresQueueTransaction } from "../src/strava-postgres.repository.js";
import { createStravaService } from "../src/strava.service.js";
import { createStravaTokenCipher } from "../src/token-cipher.js";
import { createMockStravaTransport } from "../src/strava-memory.runtime.js";

const root = fileURLToPath(new URL("../../..", import.meta.url));
function executor(client: PGliteInterface | Transaction): SqlExecutor { return { async query<TRow extends object>(sql: string, parameters: readonly unknown[] = []) { return { rows: (await client.query<TRow>(sql, [...parameters])).rows }; } }; }
const identifier = (sequence: number) => `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`;
let database: PGlite; let sql: TransactionalSqlExecutor; let sequence = 100;
const clock = { now: () => "2040-01-01T09:00:00.000Z" }; const options = { clock, idGenerator: { generate: () => identifier(++sequence) } };
beforeAll(async () => {
  database = new PGlite();
  const files: string[] = [];
  const directories = [resolve(root, "supabase/migrations"), ...(await readdir(resolve(root, "packages"), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => resolve(root, "packages", entry.name, "migrations"))];
  for (const directory of directories) {
    let entries: string[]; try { entries = await readdir(directory); } catch (error) { if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") continue; throw error; }
    files.push(...entries.filter((name) => /^\d{14}_[a-z0-9_]+\.sql$/.test(name)).map((name) => resolve(directory, name)));
  }
  for (const path of files.sort((a, b) => basename(a).localeCompare(basename(b)))) await database.exec(await readFile(path, "utf8"));
  sql = { ...executor(database), transaction: (work) => database.transaction((transaction) => work(executor(transaction))) };
}, 30_000);
afterAll(async () => { await database.close(); });
function fixture() {
  const ownerId = identifier(++sequence); const cipher = createStravaTokenCipher(Buffer.alloc(32, 1).toString("base64"));
  const service = createStravaService({ ownerId, clock, cipher, stateGenerator: { generate: () => "s".repeat(43) }, transport: createMockStravaTransport({ clock, authorizationUrl: () => "https://example.invalid" }), repository: createStravaPostgresRepository(sql, options), unitOfWork: createStravaPostgresUnitOfWork(sql, options) });
  const connect = async () => { const result = await service.beginConnect(ownerId); await service.completeConnect(ownerId, result.state, "synthetic", "activity:read"); };
  return { ownerId, service, connect };
}
describe("Strava PostgreSQL contract", () => {
  it("persists encrypted credentials, sanitized status, and idempotent Health imports", async () => {
    const f = fixture(); await f.connect(); expect((await f.service.synchronize(f.ownerId)).imported).toBe(1); expect((await f.service.synchronize(f.ownerId)).imported).toBe(0);
    const privateRows = await database.query<{ ciphertext: string }>("select ciphertext from strava.credentials where owner_id = $1", [f.ownerId]);
    expect(privateRows.rows[0]?.ciphertext).toMatch(/^v1\./); expect(privateRows.rows[0]?.ciphertext).not.toContain("synthetic-mock");
    const publicRows = await database.query<{ id: string; payload: { id: string } }>("select id, payload from platform.integration_connections where owner_id = $1", [f.ownerId]);
    expect(publicRows.rows[0]?.payload.id).toBe(publicRows.rows[0]?.id); expect(JSON.stringify(publicRows.rows)).not.toContain("athleteId");
    const healthRows = await database.query<{ payload: { status: string } }>("select payload from health.running_activities where owner_id = $1 and deleted_at is null", [f.ownerId]);
    expect(healthRows.rows).toHaveLength(1); expect(healthRows.rows[0]?.payload.status).toBe("completed");
    expect(await createStravaPostgresRepository(sql, options).connection(identifier(999))).toBeNull();
  });
  it("rolls back state and Health changes together on a write failure", async () => {
    const f = fixture(); await f.connect();
    const unitOfWork = createStravaPostgresUnitOfWork(sql, options);
    await expect(unitOfWork.run(f.ownerId, async ({ repository, health }) => { await repository.saveState(f.ownerId, "digest", "2040-01-01T10:00:00Z"); await health.createRunningActivity({ ownerId: f.ownerId }, { title: "Rollback run", startedAt: clock.now() }); throw new Error("injected"); })).rejects.toThrow("injected");
    expect((await database.query("select id from strava.oauth_states where owner_id = $1", [f.ownerId])).rows).toHaveLength(0);
    expect((await database.query("select id from health.running_activities where owner_id = $1", [f.ownerId])).rows).toHaveLength(0);
  });
  it("cascades Settings replacement to tokens, state, queues, and import receipts", async () => {
    const f = fixture(); await f.connect(); await f.service.synchronize(f.ownerId); await f.service.beginConnect(f.ownerId);
    await database.query("delete from platform.integration_connections where owner_id = $1", [f.ownerId]);
    for (const table of ["connections", "credentials", "oauth_states", "activity_imports", "webhook_events"]) expect((await database.query(`select id from strava.${table} where owner_id = $1`, [f.ownerId])).rows).toHaveLength(0);
    // Settings-only replacement does not delete Health records.
    expect((await database.query("select id from health.running_activities where owner_id = $1 and deleted_at is null", [f.ownerId])).rows).toHaveLength(1);
  });
  it("denies anonymous and authenticated SQL clients access to all private integration tables", async () => {
    for (const role of ["anon", "authenticated"]) for (const table of ["connections", "credentials", "oauth_states", "activity_imports", "webhook_events", "webhook_limits"]) {
      await expect(database.transaction(async (transaction) => { await transaction.exec(`set local role ${role}`); await transaction.query(`select * from strava.${table}`); })).rejects.toThrow(/permission denied/);
    }
    const rls = await database.query<{ relrowsecurity: boolean }>("select relrowsecurity from pg_class join pg_namespace n on n.oid = relnamespace where n.nspname = 'strava' and relkind = 'r'");
    expect(rls.rows).toHaveLength(6); expect(rls.rows.every((row) => row.relrowsecurity)).toBe(true);
  });
  it("serializes queue capacity separately from the Health import transaction", async () => {
    const f = fixture(); await f.connect(); const queue = createStravaPostgresQueueTransaction(sql, options);
    const event = { object_type: "activity" as const, aspect_type: "create" as const, object_id: 401, owner_id: 101, subscription_id: 9, event_time: Date.parse(clock.now()) / 1000, updates: {} };
    const accepted = await Promise.all(Array.from({ length: 6 }, (_, index) => queue.run(f.ownerId, (repository) => repository.enqueue({ ownerId: f.ownerId, id: String(index).padStart(8, "0") + "a".repeat(56), event, attempts: 0 }, "2040-01-01T08:59:00Z", 3))));
    expect(accepted.filter(Boolean)).toHaveLength(3); expect(await createStravaPostgresRepository(sql, options).pending(f.ownerId, 20)).toHaveLength(3);
  });
  it("retains idempotence and deletion after an archive restore excludes private Strava state", async () => {
    const f = fixture(); await f.connect(); await f.service.synchronize(f.ownerId);
    const backup = createPostgresBackupService(sql, options); const archive = await backup.export(f.ownerId, ["health", "settings"]);
    expect(JSON.stringify(archive)).not.toContain("synthetic-mock"); expect(JSON.stringify(archive)).not.toContain("encryptedTokens");
    const preview = await backup.dryRunRestore(f.ownerId, archive, "replace"); await backup.restore(f.ownerId, preview, preview.confirmation);
    expect((await database.query("select id from strava.credentials where owner_id = $1", [f.ownerId])).rows).toHaveLength(0);
    await f.connect(); expect((await f.service.synchronize(f.ownerId)).imported).toBe(0);
    expect((await database.query("select id from health.running_activities where owner_id = $1 and deleted_at is null", [f.ownerId])).rows).toHaveLength(1);
    await f.service.disconnect(f.ownerId, true, `DELETE STRAVA IMPORTS ${f.ownerId}`);
    expect((await database.query("select id from health.running_activities where owner_id = $1 and deleted_at is null", [f.ownerId])).rows).toHaveLength(0);
  });
});
