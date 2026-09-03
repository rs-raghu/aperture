import type { OwnerId, PageResult } from "../education.types.js";
import type { CreateEducationGoalInput, EducationGoal, EducationGoalId, EducationGoalListQuery, UpdateEducationGoalInput } from "./education-goal.types.js";
export type { CreateEducationGoalInput, EducationGoalListQuery, UpdateEducationGoalInput } from "./education-goal.types.js";
export declare function createEducationGoal(input: CreateEducationGoalInput): Promise<EducationGoal>;
export declare function updateEducationGoal(id: EducationGoalId, ownerId: OwnerId, input: UpdateEducationGoalInput): Promise<EducationGoal>;
export declare function completeEducationGoal(id: EducationGoalId, ownerId: OwnerId): Promise<EducationGoal>;
export declare function archiveEducationGoal(id: EducationGoalId, ownerId: OwnerId): Promise<EducationGoal>;
export declare function getEducationGoal(id: EducationGoalId, ownerId: OwnerId): Promise<EducationGoal | null>;
export declare function listEducationGoals(query: EducationGoalListQuery): Promise<PageResult<EducationGoal>>;
