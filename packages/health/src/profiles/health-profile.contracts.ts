import type { IsoDateString, MeasurementSystem, OwnerId } from "../health.types.js";
import type { HealthProfile, HealthProfileId, HealthProfileStatus } from "./health-profile.types.js";

export interface CreateHealthProfileInput {
  readonly ownerId: OwnerId;
  readonly measurementSystem: MeasurementSystem;
  readonly birthDate?: IsoDateString;
}

export interface UpdateHealthProfileInput {
  readonly measurementSystem?: MeasurementSystem;
  readonly birthDate?: IsoDateString;
  readonly status?: HealthProfileStatus;
}

export declare function createHealthProfile(input: CreateHealthProfileInput): Promise<HealthProfile>;
export declare function updateHealthProfile(
  id: HealthProfileId,
  ownerId: OwnerId,
  input: UpdateHealthProfileInput,
): Promise<HealthProfile>;
export declare function getHealthProfile(ownerId: OwnerId): Promise<HealthProfile | null>;
