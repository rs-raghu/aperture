import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type { DistanceValue, DurationValue, PaceValue, RepetitionCount, WeightValue } from "../health-units.types.js";
import type { ExerciseId } from "../exercises/exercise.types.js";
import type { RunningActivityId } from "../running/running-activity.types.js";

export type PersonalRecordId = string;
export type PersonalRecordMetric =
  | { readonly type: "distance"; readonly value: DistanceValue }
  | { readonly type: "duration"; readonly value: DurationValue }
  | { readonly type: "pace"; readonly value: PaceValue }
  | { readonly type: "repetitions"; readonly value: RepetitionCount }
  | { readonly type: "weight"; readonly value: WeightValue };

export interface PersonalRecord extends EntityMetadata {
  readonly id: PersonalRecordId;
  readonly exerciseId?: ExerciseId;
  readonly runningActivityId?: RunningActivityId;
  readonly title: string;
  readonly metric: PersonalRecordMetric;
  readonly achievedAt: IsoDateTimeString;
}
