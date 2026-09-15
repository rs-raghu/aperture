import type { OwnerId } from "../health.types.js";
import type { HealthProfile, HealthProfileId } from "./health-profile.types.js";

export interface HealthProfileRepository {
  findById(id: HealthProfileId, ownerId: OwnerId): Promise<HealthProfile | null>;
  findByOwner(ownerId: OwnerId): Promise<HealthProfile | null>;
  create(entity: HealthProfile): Promise<HealthProfile>;
  update(entity: HealthProfile): Promise<HealthProfile>;
}
