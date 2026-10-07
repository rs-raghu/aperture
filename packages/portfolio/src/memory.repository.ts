import { portfolioDraftSchema, type PortfolioDraft, type PortfolioRecoveryRepository } from "./portfolio.types.js";
export function createPortfolioMemoryRepository(): PortfolioRecoveryRepository {
  const records = new Map<string, PortfolioDraft>();
  return {
    async find(ownerId) { return structuredClone(records.get(ownerId) ?? null); },
    async save(value, expectedRevision) { const parsed = portfolioDraftSchema.parse(value); const current = records.get(parsed.ownerId); if ((current?.revision ?? 0) !== expectedRevision || parsed.revision !== expectedRevision + 1) return false; records.set(parsed.ownerId, structuredClone(parsed)); return true; },
    async deleteAll(ownerId) { records.delete(ownerId); },
    async restore(value) { const record = portfolioDraftSchema.parse({ ...value, publication: null }); if (records.has(record.ownerId)) throw new Error("Portfolio restoration would replace an existing draft without preflight."); records.set(record.ownerId, structuredClone(record)); },
  };
}
