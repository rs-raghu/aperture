import type { Grade, GradeId, GradeQuery, GradeRepository } from "@aperture/education";

import { compareText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createGradeMemoryRepository(
  collection: EntityCollection<Grade>,
): GradeRepository {
  const base = createCrudMethods<Grade, GradeId, GradeQuery>(
    collection,
    (entity, query) =>
      (query.courseId === undefined || entity.courseId === query.courseId) &&
      (query.semesterId === undefined || entity.semesterId === query.semesterId) &&
      (query.sourceType === undefined || entity.sourceType === query.sourceType),
    (left, right) => compareText(left.recordedAt, right.recordedAt),
  );
  return {
    ...base,
    findManyBySemester: (query) => base.findMany(query),
    findForGradeable: (ownerId, courseId, assignmentId, examId) => collection.findFirst(
      ownerId,
      (entity) =>
        entity.courseId === courseId &&
        entity.assignmentId === assignmentId &&
        entity.examId === examId,
    ),
  };
}
