import type { OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { DistanceValue, DurationValue, RepetitionCount, WeightValue } from "../health-units.types.js";
import type { ExerciseId } from "../exercises/exercise.types.js";
import type { WorkoutSessionId } from "../workouts/workout-session.types.js";
import type { ExerciseSet, ExerciseSetId, PerceivedEffort } from "./exercise-set.types.js";

export interface RecordExerciseSetInput {
  readonly ownerId: OwnerId;
  readonly workoutSessionId: WorkoutSessionId;
  readonly exerciseId: ExerciseId;
  readonly sequence: number;
  readonly repetitions?: RepetitionCount;
  readonly weight?: WeightValue;
  readonly duration?: DurationValue;
  readonly distance?: DistanceValue;
  readonly perceivedEffort?: PerceivedEffort;
}
export type UpdateExerciseSetInput = Partial<Omit<RecordExerciseSetInput, "ownerId" | "workoutSessionId" | "exerciseId">>;
export interface ExerciseSetListQuery extends OwnerQuery {
  readonly workoutSessionId?: WorkoutSessionId;
  readonly exerciseId?: ExerciseId;
}
export interface ExerciseSetsByWorkoutQuery extends OwnerQuery {
  readonly workoutSessionId: WorkoutSessionId;
}
export interface ExerciseSetsByExerciseQuery extends OwnerQuery {
  readonly exerciseId: ExerciseId;
}

export declare function recordExerciseSet(input: RecordExerciseSetInput): Promise<ExerciseSet>;
export declare function updateExerciseSet(id: ExerciseSetId, ownerId: OwnerId, input: UpdateExerciseSetInput): Promise<ExerciseSet>;
export declare function deleteExerciseSet(id: ExerciseSetId, ownerId: OwnerId): Promise<void>;
export declare function getExerciseSet(id: ExerciseSetId, ownerId: OwnerId): Promise<ExerciseSet | null>;
export declare function listExerciseSetsByWorkout(query: ExerciseSetsByWorkoutQuery): Promise<PageResult<ExerciseSet>>;
export declare function listExerciseSetsByExercise(query: ExerciseSetsByExerciseQuery): Promise<PageResult<ExerciseSet>>;
