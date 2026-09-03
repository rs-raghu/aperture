import type { Exam, ExamId, ExamListQuery, ExamRepository } from "@aperture/education";

import { compareText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createExamMemoryRepository(
  collection: EntityCollection<Exam>,
): ExamRepository {
  return createCrudMethods<Exam, ExamId, ExamListQuery>(
    collection,
    (entity, query) =>
      (query.courseId === undefined || entity.courseId === query.courseId) &&
      (query.examType === undefined || entity.examType === query.examType) &&
      (query.status === undefined || entity.status === query.status) &&
      (query.startsAfter === undefined || entity.scheduledStartsAt >= query.startsAfter) &&
      (query.startsBefore === undefined || entity.scheduledStartsAt <= query.startsBefore),
    (left, right) => compareText(left.scheduledStartsAt, right.scheduledStartsAt),
  );
}
