import type { CrudRepository } from "../repositories/repository.types.js";
import type { IsoDateString, OwnerId } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { AttendanceQuery, AttendanceRecord, AttendanceRecordId } from "./attendance.types.js";

export interface AttendanceRepository
  extends CrudRepository<AttendanceRecord, AttendanceRecordId, AttendanceQuery> {
  findByCourseAndSessionDate(ownerId: OwnerId, courseId: CourseId, sessionDate: IsoDateString): Promise<AttendanceRecord | null>;
}
