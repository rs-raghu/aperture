import type { EntityMetadata, IsoDateTimeString } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";

export type ScheduleEntryId = string;
export type ScheduleEntryStatus = "scheduled" | "completed" | "cancelled";

export interface ScheduleEntry extends EntityMetadata {
  readonly id: ScheduleEntryId;
  readonly courseId?: CourseId;
  readonly title: string;
  readonly status: ScheduleEntryStatus;
  readonly startsAt: IsoDateTimeString;
  readonly endsAt: IsoDateTimeString;
}
