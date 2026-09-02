import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateWorkoutSessionInput, UpdateWorkoutSessionInput, WorkoutSessionListQuery } from "./workout-session.contracts.js";
import type { WorkoutSession, WorkoutSessionId } from "./workout-session.types.js";

export interface WorkoutSessionRepository
  extends CrudRepository<WorkoutSession, WorkoutSessionId, CreateWorkoutSessionInput, UpdateWorkoutSessionInput, WorkoutSessionListQuery> {}
