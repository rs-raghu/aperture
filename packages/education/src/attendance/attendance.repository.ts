import type { CrudRepository } from "../repositories/repository.types.js";
import type { AttendanceByCourseQuery, RecordAttendanceInput, UpdateAttendanceInput } from "./attendance.contracts.js";
import type { AttendanceRecord, AttendanceRecordId } from "./attendance.types.js";

export interface AttendanceRepository
  extends CrudRepository<AttendanceRecord, AttendanceRecordId, RecordAttendanceInput, UpdateAttendanceInput, AttendanceByCourseQuery> {}
