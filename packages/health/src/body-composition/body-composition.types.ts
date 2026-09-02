import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type { DistanceValue, HeightValue, PercentageValue, WeightValue } from "../health-units.types.js";

export type BodyCompositionRecordId = string;

export interface BodyCompositionRecord extends EntityMetadata {
  readonly id: BodyCompositionRecordId;
  readonly observedAt: IsoDateTimeString;
  readonly weight?: WeightValue;
  readonly height?: HeightValue;
  readonly bodyFat?: PercentageValue;
  readonly waist?: DistanceValue;
  readonly hip?: DistanceValue;
  readonly muscleMass?: WeightValue;
}
