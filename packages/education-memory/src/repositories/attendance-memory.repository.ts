import type { AttendanceQuery, AttendanceRecord, AttendanceRecordId, AttendanceRepository } from "@aperture/education";

import { compareText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createAttendanceMemoryRepository(
  collection: EntityCollection<AttendanceRecord>,
): AttendanceRepository {
  const base = createCrudMethods<AttendanceRecord, AttendanceRecordId, AttendanceQuery>(
    collection,
    (entity, query) =>
      (query.courseId === undefined || entity.courseId === query.courseId) &&
      (query.status === undefined || entity.status === query.status) &&
      (query.source === undefined || entity.source === query.source) &&
      (query.dateFrom === undefined || entity.sessionDate >= query.dateFrom) &&
      (query.dateTo === undefined || entity.sessionDate <= query.dateTo),
    (left, right) => compareText(left.sessionDate, right.sessionDate),
  );
  return {
    ...base,
    findByCourseAndSessionDate: (ownerId, courseId, sessionDate) => collection.findFirst(
      ownerId,
      (entity) => entity.courseId === courseId && entity.sessionDate === sessionDate,
    ),
  };
}
