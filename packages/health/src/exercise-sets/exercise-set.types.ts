import type { EntityMetadata } from "../health.types.js";
import type { DistanceValue, DurationValue, RepetitionCount, WeightValue } from "../health-units.types.js";
import type { ExerciseId } from "../exercises/exercise.types.js";
import type { WorkoutSessionId } from "../workouts/workout-session.types.js";

export type ExerciseSetId = string;

export interface PerceivedEffort {
  readonly value: number;
  readonly scale: "one_to_ten";
}

export interface ExerciseSet extends EntityMetadata {
  readonly id: ExerciseSetId;
  readonly workoutSessionId: WorkoutSessionId;
  readonly exerciseId: ExerciseId;
  readonly sequence: number;
  readonly repetitions?: RepetitionCount;
  readonly weight?: WeightValue;
  readonly duration?: DurationValue;
  readonly distance?: DistanceValue;
  readonly perceivedEffort?: PerceivedEffort;
}
