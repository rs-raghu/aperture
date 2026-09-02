import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type { DistanceValue, HeightValue, WeightValue } from "../health-units.types.js";

export type HealthMeasurementId = string;
export type HealthMeasurementType = "weight" | "height" | "waist" | "hip";
export type HealthMeasurementValue = WeightValue | HeightValue | DistanceValue;

export interface HealthMeasurement extends EntityMetadata {
  readonly id: HealthMeasurementId;
  readonly type: HealthMeasurementType;
  readonly measurement: HealthMeasurementValue;
  readonly observedAt: IsoDateTimeString;
}
