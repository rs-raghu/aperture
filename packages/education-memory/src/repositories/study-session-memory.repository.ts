import type { StudySession, StudySessionId, StudySessionListQuery, StudySessionRepository } from "@aperture/education";

import { compareText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createStudySessionMemoryRepository(
  collection: EntityCollection<StudySession>,
): StudySessionRepository {
  return createCrudMethods<StudySession, StudySessionId, StudySessionListQuery>(
    collection,
    (entity, query) =>
      (query.courseId === undefined || entity.courseId === query.courseId) &&
      (query.topicId === undefined || entity.topicId === query.topicId) &&
      (query.status === undefined || entity.status === query.status) &&
      (query.method === undefined || entity.method === query.method) &&
      (query.startsAfter === undefined || entity.plannedStartsAt >= query.startsAfter) &&
      (query.startsBefore === undefined || entity.plannedStartsAt <= query.startsBefore),
    (left, right) => compareText(left.plannedStartsAt, right.plannedStartsAt),
  );
}
