import type { OwnerId } from "../health.types.js";
import type { CreateHealthProfileInput, UpdateHealthProfileInput } from "./health-profile.contracts.js";
import type { HealthProfile, HealthProfileId } from "./health-profile.types.js";

export interface HealthProfileRepository {
  findById(id: HealthProfileId, ownerId: OwnerId): Promise<HealthProfile | null>;
  findByOwner(ownerId: OwnerId): Promise<HealthProfile | null>;
  create(input: CreateHealthProfileInput): Promise<HealthProfile>;
  update(id: HealthProfileId, ownerId: OwnerId, input: UpdateHealthProfileInput): Promise<HealthProfile>;
}
