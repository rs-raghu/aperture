import type { CrudRepository } from "../repositories/repository.types.js";
import type { WorkoutPlanListQuery } from "./workout-plan.contracts.js";
import type { WorkoutPlan, WorkoutPlanId } from "./workout-plan.types.js";

export interface WorkoutPlanRepository
  extends CrudRepository<WorkoutPlan, WorkoutPlanId, WorkoutPlanListQuery> {}
