import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateWorkoutPlanInput, UpdateWorkoutPlanInput, WorkoutPlanListQuery } from "./workout-plan.contracts.js";
import type { WorkoutPlan, WorkoutPlanId } from "./workout-plan.types.js";

export interface WorkoutPlanRepository
  extends CrudRepository<WorkoutPlan, WorkoutPlanId, CreateWorkoutPlanInput, UpdateWorkoutPlanInput, WorkoutPlanListQuery> {}
