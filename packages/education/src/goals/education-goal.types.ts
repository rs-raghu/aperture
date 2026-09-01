import type { EntityMetadata, IsoDateString } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { ProgramId } from "../programs/program.types.js";
import type { SemesterId } from "../semesters/semester.types.js";

export type EducationGoalId = string;
export type EducationGoalStatus = "active" | "completed" | "archived";

export interface EducationGoal extends EntityMetadata {
  readonly id: EducationGoalId;
  readonly programId?: ProgramId;
  readonly semesterId?: SemesterId;
  readonly courseId?: CourseId;
  readonly title: string;
  readonly status: EducationGoalStatus;
  readonly targetDate?: IsoDateString;
}
