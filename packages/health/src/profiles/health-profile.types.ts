import type { EntityMetadata, IsoDateString, MeasurementSystem } from "../health.types.js";

export type HealthProfileId = string;
export type HealthProfileStatus = "active" | "archived";

export interface HealthProfile extends EntityMetadata {
  readonly id: HealthProfileId;
  readonly measurementSystem: MeasurementSystem;
  readonly birthDate?: IsoDateString;
  readonly status: HealthProfileStatus;
}
