import type { EntityMetadata, IsoDateString } from "../education.types.js";
import type { ProgramId } from "../programs/program.types.js";
import type { SemesterId } from "../semesters/semester.types.js";

export type CourseId = string;
export type CourseStatus = "planned" | "active" | "completed" | "archived";

export interface Course extends EntityMetadata {
  readonly id: CourseId;
  readonly programId: ProgramId;
  readonly semesterId?: SemesterId;
  readonly code?: string;
  readonly title: string;
  readonly status: CourseStatus;
  readonly startsOn?: IsoDateString;
  readonly endsOn?: IsoDateString;
}
