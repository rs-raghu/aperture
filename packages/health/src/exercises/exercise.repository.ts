import type { CrudRepository } from "../repositories/repository.types.js";
import type { ExerciseListQuery } from "./exercise.contracts.js";
import type { Exercise, ExerciseId } from "./exercise.types.js";

export interface ExerciseRepository
  extends CrudRepository<Exercise, ExerciseId, ExerciseListQuery> {}
