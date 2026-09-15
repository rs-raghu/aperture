import type { HealthProfile, HealthProfileRepository, OwnerId } from "@aperture/health";

import { HealthMemoryRepositoryError } from "../health-memory.errors.js";
import type { EntityCollection } from "../store/entity-collection.js";

export function createHealthProfileMemoryRepository(
  collection: EntityCollection<HealthProfile>,
): HealthProfileRepository {
  const ownerIds = new Map<OwnerId, string>();

  return {
    findById: (id, ownerId) => collection.findById(id, ownerId),
    async findByOwner(ownerId) {
      const id = ownerIds.get(ownerId);
      return id === undefined ? null : collection.findById(id, ownerId);
    },
    async create(entity) {
      if (ownerIds.has(entity.ownerId)) {
        throw new HealthMemoryRepositoryError(
          "health-memory-owner-conflict",
          "A health profile already exists for this owner.",
          { entityId: entity.id, field: "ownerId" },
        );
      }
      ownerIds.set(entity.ownerId, entity.id);
      try {
        return await collection.create(entity);
      } catch (error) {
        if (ownerIds.get(entity.ownerId) === entity.id) ownerIds.delete(entity.ownerId);
        throw error;
      }
    },
    update: (entity) => collection.update(entity),
  };
}
