import { checksum, type BackupFeatureAdapter, type BackupFeaturePayload } from "@aperture/backup";
import { portfolioDraftSchema, type PortfolioRepository, type PortfolioRecoveryRepository } from "./portfolio.types.js";
export function createPortfolioBackupAdapter(repository: PortfolioRepository, recovery?: Pick<PortfolioRecoveryRepository, "deleteAll" | "restore">): BackupFeatureAdapter {
  const requireRecovery = () => { if (recovery === undefined) throw new Error("Portfolio recovery requires the server transaction boundary."); return recovery; };
  async function merge(ownerId: string, payload: BackupFeaturePayload) { for (const value of payload.collections[0]?.records ?? []) { const record = portfolioDraftSchema.parse(value); if (record.ownerId !== ownerId) throw new Error("Portfolio recovery owner mismatch."); await requireRecovery().restore({ ...record, publication: null }); } }
  const adapter: BackupFeatureAdapter = {
    featureId: "portfolio", schemaVersion: 1,
    async export(ownerId) { const record = await repository.find(ownerId); return [{ name: "draft", records: record === null ? [] : [{ ...record, publication: null }] }]; },
    async validate(ownerId, payload) { const collection = payload.collections[0]; const valid = payload.collections.length === 1 && collection?.name === "draft" && collection.records.length <= 1 && collection.records.every((value) => { const result = portfolioDraftSchema.safeParse(value); return result.success && result.data.ownerId === ownerId && result.data.revision > 0 && result.data.publication === null; }); return valid ? [] : [{ code: "backup-invalid-feature", message: "Portfolio recovery requires a valid owner-scoped private draft.", featureId: "portfolio" }]; },
    async listRecordIdentities(ownerId) { const record = await repository.find(ownerId); return record === null ? [] : [{ collection: "draft", recordId: record.id, fingerprint: checksum(record) }]; },
    merge,
    async replace(ownerId, payload) { await requireRecovery().deleteAll(ownerId); await merge(ownerId, payload); },
    async deleteAll(ownerId) { await requireRecovery().deleteAll(ownerId); },
  };
  return Object.freeze(adapter);
}
