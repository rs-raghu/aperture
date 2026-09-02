import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type { HeartRateValue, HeartRateVariabilityValue } from "../health-units.types.js";

export type RecoveryEntryId = string;

export interface RecoveryRating {
  readonly value: number;
  readonly scale: "one_to_ten";
}

export interface RecoveryEntry extends EntityMetadata {
  readonly id: RecoveryEntryId;
  readonly observedAt: IsoDateTimeString;
  readonly energy?: RecoveryRating;
  readonly soreness?: RecoveryRating;
  readonly fatigue?: RecoveryRating;
  readonly mood?: RecoveryRating;
  readonly restingHeartRate?: HeartRateValue;
  readonly heartRateVariability?: HeartRateVariabilityValue;
}
