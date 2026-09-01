import type { IsoDateString, OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { ProgramId } from "../programs/program.types.js";
import type { SemesterId } from "../semesters/semester.types.js";
import type { EducationGoal, EducationGoalId, EducationGoalStatus } from "./education-goal.types.js";

export interface CreateEducationGoalInput {
  readonly ownerId: OwnerId;
  readonly programId?: ProgramId;
  readonly semesterId?: SemesterId;
  readonly courseId?: CourseId;
  readonly title: string;
  readonly targetDate?: IsoDateString;
}

export interface UpdateEducationGoalInput {
  readonly title?: string;
  readonly status?: EducationGoalStatus;
  readonly targetDate?: IsoDateString;
}

export interface EducationGoalListQuery extends OwnerQuery {
  readonly programId?: ProgramId;
  readonly semesterId?: SemesterId;
  readonly courseId?: CourseId;
  readonly status?: EducationGoalStatus;
}

export declare function createEducationGoal(input: CreateEducationGoalInput): Promise<EducationGoal>;
export declare function updateEducationGoal(id: EducationGoalId, ownerId: OwnerId, input: UpdateEducationGoalInput): Promise<EducationGoal>;
export declare function completeEducationGoal(id: EducationGoalId, ownerId: OwnerId): Promise<EducationGoal>;
export declare function archiveEducationGoal(id: EducationGoalId, ownerId: OwnerId): Promise<EducationGoal>;
export declare function getEducationGoal(id: EducationGoalId, ownerId: OwnerId): Promise<EducationGoal | null>;
export declare function listEducationGoals(query: EducationGoalListQuery): Promise<PageResult<EducationGoal>>;
