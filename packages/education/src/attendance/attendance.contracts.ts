import type { IsoDateString, OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { AttendanceRecord, AttendanceRecordId, AttendanceStatus } from "./attendance.types.js";

export interface RecordAttendanceInput {
  readonly ownerId: OwnerId;
  readonly courseId: CourseId;
  readonly sessionDate: IsoDateString;
  readonly status: AttendanceStatus;
}

export interface UpdateAttendanceInput {
  readonly sessionDate?: IsoDateString;
  readonly status?: AttendanceStatus;
}

export interface AttendanceByCourseQuery extends OwnerQuery {
  readonly courseId: CourseId;
}

export interface CourseAttendanceSummaryQuery {
  readonly ownerId: OwnerId;
  readonly courseId: CourseId;
}

export interface CourseAttendanceSummary {
  readonly courseId: CourseId;
  readonly presentCount: number;
  readonly absentCount: number;
  readonly excusedCount: number;
  readonly totalCount: number;
  readonly attendancePercentage: number;
}

export declare function recordAttendance(input: RecordAttendanceInput): Promise<AttendanceRecord>;
export declare function updateAttendance(id: AttendanceRecordId, ownerId: OwnerId, input: UpdateAttendanceInput): Promise<AttendanceRecord>;
export declare function deleteAttendance(id: AttendanceRecordId, ownerId: OwnerId): Promise<void>;
export declare function listAttendanceByCourse(query: AttendanceByCourseQuery): Promise<PageResult<AttendanceRecord>>;
export declare function getCourseAttendanceSummary(query: CourseAttendanceSummaryQuery): Promise<CourseAttendanceSummary>;
