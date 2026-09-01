import type { EntityMetadata, IsoDateTimeString } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { SemesterId } from "../semesters/semester.types.js";

export type ExamId = string;
export type ExamStatus = "scheduled" | "completed";

export interface Exam extends EntityMetadata {
  readonly id: ExamId;
  readonly courseId: CourseId;
  readonly semesterId: SemesterId;
  readonly title: string;
  readonly status: ExamStatus;
  readonly startsAt: IsoDateTimeString;
  readonly endsAt?: IsoDateTimeString;
}
