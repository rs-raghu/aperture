import type { Assignment, AssignmentId, AssignmentListQuery, AssignmentRepository } from "@aperture/education";

import { compareOptionalText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createAssignmentMemoryRepository(
  collection: EntityCollection<Assignment>,
): AssignmentRepository {
  return createCrudMethods<Assignment, AssignmentId, AssignmentListQuery>(
    collection,
    (entity, query) =>
      (query.courseId === undefined || entity.courseId === query.courseId) &&
      (query.status === undefined || entity.status === query.status) &&
      (query.priority === undefined || entity.priority === query.priority) &&
      (query.dueFrom === undefined || (entity.dueAt !== undefined && entity.dueAt >= query.dueFrom)) &&
      (query.dueTo === undefined || (entity.dueAt !== undefined && entity.dueAt <= query.dueTo)),
    (left, right) => compareOptionalText(left.dueAt, right.dueAt),
  );
}
