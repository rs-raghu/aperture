import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateEquipmentInput, EquipmentListQuery, RecordEquipmentUsageInput, UpdateEquipmentInput } from "./equipment.contracts.js";
import type { Equipment, EquipmentId, EquipmentUsageSummary } from "./equipment.types.js";

export interface EquipmentRepository
  extends CrudRepository<Equipment, EquipmentId, CreateEquipmentInput, UpdateEquipmentInput, EquipmentListQuery> {
  recordUsage(input: RecordEquipmentUsageInput): Promise<EquipmentUsageSummary>;
  getUsageSummary(id: EquipmentId, ownerId: EquipmentListQuery["ownerId"]): Promise<EquipmentUsageSummary>;
}
