import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { PGlite, type PGliteInterface, type Transaction } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { createPortfolioService, type PortfolioDraft } from "../src/index.js";
import { createPostgresPortfolioRepository, type PortfolioSqlExecutor } from "../src/storage.js";
import { createPortfolioBackupAdapter } from "../src/backup.js";
import { createBackupService } from "@aperture/backup";
import { OWNER_A, OWNER_B, content } from "./fixtures.js";
function executor(client: PGliteInterface | Transaction): PortfolioSqlExecutor { return { async query<TRow extends object>(sql: string, parameters: readonly unknown[] = []) { return { rows: (await client.query<TRow>(sql, [...parameters])).rows }; } }; }
let database: PGlite; let sequence = 100;
const clock = { now: () => "2040-01-01T09:00:00.000Z" }; const idGenerator = { generate: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}` };
beforeAll(async () => { database = new PGlite(); for (const path of ["../../../supabase/migrations/20260921000100_core.sql", "../../../supabase/migrations/20260921006000_personal_auth_security.sql", "../migrations/20261007001000_portfolio.sql"]) await database.exec(await readFile(new URL(path, import.meta.url), "utf8")); }, 30_000);
afterAll(async () => database.close());
const serviceFor = () => createPortfolioService({ repository: createPostgresPortfolioRepository(executor(database)), clock, idGenerator });
async function authenticated<T>(ownerId: string, work: (transaction: Transaction) => Promise<T>) { return database.transaction(async (transaction) => { await transaction.query("select set_config('request.jwt.claim.sub', $1, true)", [ownerId]); await transaction.exec("set local role authenticated"); return work(transaction); }); }
describe("portfolio storage and publication isolation", () => {
  it("persists drafts across adapters and rejects stale compare-and-save writes", async () => {
    const service = serviceFor(); const draft = await service.saveDraft(OWNER_A, content(), 0);
    expect((await serviceFor().getDraft(OWNER_A)).content).toEqual(content());
    expect(await createPostgresPortfolioRepository(executor(database)).save({ ...draft, revision: 2 }, 0)).toBe(false);
    await expect(service.saveDraft(OWNER_A, content(), 0)).rejects.toThrow(/another device/);
  });
  it("uses owner RLS for the invoker RPC, denies cross-owner changes, and rejects replayed revisions", async () => {
    const source = await serviceFor().getDraft(OWNER_B); const candidate: PortfolioDraft = { ...source, revision: 1, content: content() };
    const saved = await authenticated(OWNER_B, (transaction) => transaction.query<{ saved: boolean }>("select portfolio.save_draft($1::jsonb, 0) as saved", [JSON.stringify(candidate)])); expect(saved.rows[0]?.saved).toBe(true);
    expect((await authenticated(OWNER_B, (transaction) => transaction.query<{ saved: boolean }>("select portfolio.save_draft($1::jsonb, 0) as saved", [JSON.stringify(candidate)]))).rows[0]?.saved).toBe(false);
    expect((await authenticated(OWNER_B, (transaction) => transaction.query("select id from portfolio.drafts where owner_id = $1", [OWNER_A]))).rows).toHaveLength(0);
    await expect(authenticated(OWNER_A, (transaction) => transaction.query("select portfolio.save_draft($1::jsonb, 0)", [JSON.stringify(candidate)]))).rejects.toThrow(/owner denied/);
    await expect(authenticated(OWNER_A, (transaction) => transaction.query("select portfolio.save_draft('{}'::jsonb, 0)"))).rejects.toThrow(/owner denied/);
    await expect(database.transaction(async (transaction) => { await transaction.exec("set local role anon"); await transaction.query("select payload from portfolio.drafts"); })).rejects.toThrow(/permission denied/);
  });
  it("round-trips curated data through recovery while removing any public snapshot", async () => {
    const repository = createPostgresPortfolioRepository(executor(database)); const service = serviceFor(); const before = await service.getDraft(OWNER_A);
    await service.preparePublication(OWNER_A, before.revision, `PUBLISH PORTFOLIO ${OWNER_A}`);
    const backup = createBackupService({ adapters: [createPortfolioBackupAdapter(repository, repository)], clock, idGenerator, transactionRunner: { run: (work) => database.transaction((transaction) => { const scoped = createPostgresPortfolioRepository(executor(transaction)); return work([createPortfolioBackupAdapter(scoped, scoped)]); }) } });
    const archive = await backup.export(OWNER_A); expect(archive.features[0]?.collections[0]?.records[0]?.publication).toBeNull();
    const preview = await backup.dryRunRestore(OWNER_A, archive, "replace"); await backup.restore(OWNER_A, preview, preview.confirmation);
    expect((await service.getDraft(OWNER_A)).content).toEqual(content()); expect(await service.readPublic(OWNER_A, true)).toBeNull();
    const deletion = await backup.dryRunDeletion(OWNER_A); await backup.deleteData(OWNER_A, deletion, deletion.confirmation); expect(await repository.find(OWNER_A)).toBeNull();
  });
});
