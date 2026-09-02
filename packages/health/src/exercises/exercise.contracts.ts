import type { OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { Exercise, ExerciseCategory, ExerciseId, ExerciseStatus } from "./exercise.types.js";

export interface CreateExerciseInput {
  readonly ownerId: OwnerId;
  readonly name: string;
  readonly category: ExerciseCategory;
}
export interface UpdateExerciseInput {
  readonly name?: string;
  readonly category?: ExerciseCategory;
  readonly status?: ExerciseStatus;
}
export interface ExerciseListQuery extends OwnerQuery {
  readonly category?: ExerciseCategory;
  readonly status?: ExerciseStatus;
}
export interface ExercisesByCategoryQuery extends OwnerQuery {
  readonly category: ExerciseCategory;
}

export declare function createExercise(input: CreateExerciseInput): Promise<Exercise>;
export declare function updateExercise(id: ExerciseId, ownerId: OwnerId, input: UpdateExerciseInput): Promise<Exercise>;
export declare function archiveExercise(id: ExerciseId, ownerId: OwnerId): Promise<Exercise>;
export declare function getExercise(id: ExerciseId, ownerId: OwnerId): Promise<Exercise | null>;
export declare function listExercises(query: ExerciseListQuery): Promise<PageResult<Exercise>>;
export declare function listExercisesByCategory(query: ExercisesByCategoryQuery): Promise<PageResult<Exercise>>;
