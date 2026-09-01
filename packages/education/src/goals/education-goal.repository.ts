import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateEducationGoalInput, EducationGoalListQuery, UpdateEducationGoalInput } from "./education-goal.contracts.js";
import type { EducationGoal, EducationGoalId } from "./education-goal.types.js";

export interface EducationGoalRepository
  extends CrudRepository<EducationGoal, EducationGoalId, CreateEducationGoalInput, UpdateEducationGoalInput, EducationGoalListQuery> {
  complete(id: EducationGoalId, ownerId: string): Promise<EducationGoal>;
  archive(id: EducationGoalId, ownerId: string): Promise<EducationGoal>;
}
