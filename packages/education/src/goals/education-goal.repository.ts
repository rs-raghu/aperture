import type { CrudRepository } from "../repositories/repository.types.js";
import type { EducationGoal, EducationGoalId, EducationGoalListQuery } from "./education-goal.types.js";

export interface EducationGoalRepository
  extends CrudRepository<EducationGoal, EducationGoalId, EducationGoalListQuery> {}
