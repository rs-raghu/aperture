import {
  calculateRunningSummary,
  equipmentUsageSummarySchema,
  type Equipment,
  type EquipmentId,
  type EquipmentListQuery,
  type EquipmentRepository,
  type EquipmentUsageSummary,
  type OwnerId,
  type RecordEquipmentUsageInput,
} from "@aperture/health";

import { HealthMemoryRepositoryError } from "../health-memory.errors.js";
import { cloneValue } from "../store/cloning.js";
import { compareText, type EntityCollection } from "../store/entity-collection.js";
import { createMemoryCrud } from "./entity-memory.repositories.js";

export function createEquipmentMemoryRepository(
  collection: EntityCollection<Equipment>,
  cloneValues: boolean,
): EquipmentRepository {
  const usageRecords: RecordEquipmentUsageInput[] = [];
  const base = createMemoryCrud<Equipment, EquipmentId, EquipmentListQuery>(
    collection,
    (entity, query) =>
      (query.category === undefined || entity.category === query.category) &&
      (query.status === undefined || entity.status === query.status),
    (left, right) => compareText(left.name, right.name),
  );

  async function requireOwnedEquipment(id: EquipmentId, ownerId: OwnerId): Promise<void> {
    if (await collection.findById(id, ownerId) === null) {
      throw new HealthMemoryRepositoryError(
        "health-memory-record-not-found",
        "The requested equipment record is unavailable.",
        { entityId: id },
      );
    }
  }

  async function getUsageSummary(id: EquipmentId, ownerId: OwnerId): Promise<EquipmentUsageSummary> {
    await requireOwnedEquipment(id, ownerId);
    const matching = usageRecords.filter((usage) => usage.equipmentId === id && usage.ownerId === ownerId);
    if (matching.length === 0) return equipmentUsageSummarySchema.parse({ equipmentId: id, useCount: 0 });

    const calculation = calculateRunningSummary({
      activities: matching.map((usage) => ({
        distance: usage.distance ?? { value: "0", unit: "kilometer" },
        duration: usage.duration ?? { value: "0", unit: "second" },
      })),
      outputDistanceUnit: "kilometer",
    });
    return equipmentUsageSummarySchema.parse({
      equipmentId: id,
      useCount: matching.length,
      ...(matching.some((usage) => usage.distance !== undefined) ? { totalDistance: calculation.totalDistance } : {}),
      ...(matching.some((usage) => usage.duration !== undefined) ? { totalDuration: calculation.totalDuration } : {}),
    });
  }

  return {
    ...base,
    async delete(id, ownerId) {
      await base.delete(id, ownerId);
      for (let index = usageRecords.length - 1; index >= 0; index -= 1) {
        const usage = usageRecords[index];
        if (usage?.equipmentId === id && usage.ownerId === ownerId) usageRecords.splice(index, 1);
      }
    },
    async recordUsage(input) {
      await requireOwnedEquipment(input.equipmentId, input.ownerId);
      usageRecords.push(cloneValue(input, cloneValues));
      return getUsageSummary(input.equipmentId, input.ownerId);
    },
    getUsageSummary,
  };
}
