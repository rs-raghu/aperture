import type { EntityMetadata, IsoDateString } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";

export type AttendanceRecordId = string;
export type AttendanceStatus = "present" | "absent" | "excused";

export interface AttendanceRecord extends EntityMetadata {
  readonly id: AttendanceRecordId;
  readonly courseId: CourseId;
  readonly sessionDate: IsoDateString;
  readonly status: AttendanceStatus;
}
