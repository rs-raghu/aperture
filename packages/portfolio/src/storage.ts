import { portfolioDraftSchema, type PortfolioDraft, type PortfolioRecoveryRepository } from "./portfolio.types.js";
export interface PortfolioSqlExecutor { query<TRow extends object>(sql: string, parameters?: readonly unknown[]): Promise<{ readonly rows: readonly TRow[] }>; }
export function createPostgresPortfolioRepository(database: PortfolioSqlExecutor): PortfolioRecoveryRepository {
  return {
    async find(ownerId) { const row = (await database.query<{ payload: unknown }>("select payload from portfolio.drafts where owner_id = $1 and deleted_at is null", [ownerId])).rows[0]; return row === undefined ? null : portfolioDraftSchema.parse(row.payload); },
    async save(value: PortfolioDraft, expectedRevision: number) {
      const record = portfolioDraftSchema.parse(value); if (record.revision !== expectedRevision + 1) return false;
      const parameters = [record.id, record.ownerId, JSON.stringify(record), record.createdAt, record.updatedAt, expectedRevision];
      if (expectedRevision === 0) return (await database.query("insert into portfolio.drafts(id, owner_id, payload, created_at, updated_at, record_version) values ($1, $2, $3::jsonb, $4::timestamptz, $5::timestamptz, 1) on conflict (owner_id) do nothing returning id", parameters.slice(0, 5))).rows.length === 1;
      return (await database.query("update portfolio.drafts set payload = $3::jsonb, updated_at = $4::timestamptz, record_version = record_version + 1 where id = $1 and owner_id = $2 and record_version = $5 and deleted_at is null returning id", [record.id, record.ownerId, JSON.stringify(record), record.updatedAt, expectedRevision])).rows.length === 1;
    },
    async deleteAll(ownerId) { await database.query("delete from portfolio.drafts where owner_id = $1", [ownerId]); },
    async restore(value) { const record = portfolioDraftSchema.parse({ ...value, publication: null }); if (record.revision < 1) throw new Error("Only persisted portfolio revisions can be restored."); await database.query("insert into portfolio.drafts(id, owner_id, payload, created_at, updated_at, record_version) values ($1, $2, $3::jsonb, $4::timestamptz, $5::timestamptz, $6)", [record.id, record.ownerId, JSON.stringify(record), record.createdAt, record.updatedAt, record.revision]); },
  };
}
