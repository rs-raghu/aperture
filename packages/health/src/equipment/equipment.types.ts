import type { EntityMetadata, IsoDateString } from "../health.types.js";
import type { DistanceValue, DurationValue } from "../health-units.types.js";

export type EquipmentId = string;
export type EquipmentCategory = "running_shoes" | "strength" | "cardio" | "mobility" | "other";
export type EquipmentStatus = "active" | "retired";

export interface Equipment extends EntityMetadata {
  readonly id: EquipmentId;
  readonly name: string;
  readonly category: EquipmentCategory;
  readonly status: EquipmentStatus;
  readonly acquiredOn?: IsoDateString;
}

export interface EquipmentUsageSummary {
  readonly equipmentId: EquipmentId;
  readonly totalDistance?: DistanceValue;
  readonly totalDuration?: DurationValue;
  readonly useCount: number;
}
