import type { LearningResource, ResourceId, ResourceRepository, ResourcesByCourseQuery } from "@aperture/education";

import { compareText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createResourceMemoryRepository(
  collection: EntityCollection<LearningResource>,
): ResourceRepository {
  return createCrudMethods<LearningResource, ResourceId, ResourcesByCourseQuery>(
    collection,
    (entity, query) =>
      entity.courseId === query.courseId &&
      (query.topicId === undefined || entity.topicId === query.topicId) &&
      (query.type === undefined || entity.type === query.type) &&
      (query.status === undefined || entity.status === query.status),
    (left, right) => compareText(left.title, right.title),
  );
}
