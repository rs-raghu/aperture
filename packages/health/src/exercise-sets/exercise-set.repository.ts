import type { CrudRepository } from "../repositories/repository.types.js";
import type { ExerciseSetListQuery, RecordExerciseSetInput, UpdateExerciseSetInput } from "./exercise-set.contracts.js";
import type { ExerciseSet, ExerciseSetId } from "./exercise-set.types.js";

export interface ExerciseSetRepository
  extends CrudRepository<ExerciseSet, ExerciseSetId, RecordExerciseSetInput, UpdateExerciseSetInput, ExerciseSetListQuery> {}
