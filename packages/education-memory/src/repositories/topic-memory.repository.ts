import type { CourseTopic, TopicId, TopicRepository, TopicsByCourseQuery } from "@aperture/education";

import { createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createTopicMemoryRepository(
  collection: EntityCollection<CourseTopic>,
): TopicRepository {
  return createCrudMethods<CourseTopic, TopicId, TopicsByCourseQuery>(
    collection,
    (entity, query) =>
      entity.courseId === query.courseId &&
      (query.parentTopicId === undefined || entity.parentTopicId === query.parentTopicId) &&
      (query.status === undefined || entity.status === query.status),
    (left, right) => left.sequence - right.sequence,
  );
}
