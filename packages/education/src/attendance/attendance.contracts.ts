import type { OwnerId, PageResult } from "../education.types.js";
import type { AttendanceByCourseQuery, AttendanceRecord, AttendanceRecordId, RecordAttendanceInput, UpdateAttendanceInput } from "./attendance.types.js";
import type { CourseId } from "../courses/course.types.js";
export type { AttendanceByCourseQuery, RecordAttendanceInput, UpdateAttendanceInput } from "./attendance.types.js";
export interface CourseAttendanceSummaryQuery { readonly ownerId: OwnerId; readonly courseId: CourseId; }
export interface CourseAttendanceSummary { readonly courseId: CourseId; readonly presentCount: number; readonly absentCount: number; readonly excusedCount: number; readonly totalCount: number; readonly attendancePercentage: number; }
export declare function recordAttendance(input: RecordAttendanceInput): Promise<AttendanceRecord>;
export declare function updateAttendance(id: AttendanceRecordId, ownerId: OwnerId, input: UpdateAttendanceInput): Promise<AttendanceRecord>;
export declare function deleteAttendance(id: AttendanceRecordId, ownerId: OwnerId): Promise<void>;
export declare function listAttendanceByCourse(query: AttendanceByCourseQuery): Promise<PageResult<AttendanceRecord>>;
export declare function getCourseAttendanceSummary(query: CourseAttendanceSummaryQuery): Promise<CourseAttendanceSummary>;
