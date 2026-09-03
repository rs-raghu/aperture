import type { Course, CourseId, CourseListQuery, CourseRepository } from "@aperture/education";

import { compareText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createCourseMemoryRepository(
  collection: EntityCollection<Course>,
): CourseRepository {
  const base = createCrudMethods<Course, CourseId, CourseListQuery>(
    collection,
    (entity, query) =>
      (query.semesterId === undefined || entity.semesterId === query.semesterId) &&
      (query.status === undefined || entity.status === query.status) &&
      (query.deliveryMode === undefined || entity.deliveryMode === query.deliveryMode) &&
      (query.search === undefined || `${entity.code ?? ""} ${entity.name}`.toLowerCase().includes(query.search.toLowerCase())),
    (left, right) => compareText(left.code ?? left.name, right.code ?? right.name),
  );
  return {
    ...base,
    findByCode: (ownerId, semesterId, code) => collection.findFirst(
      ownerId,
      (entity) => entity.semesterId === semesterId && entity.code === code,
    ),
  };
}
