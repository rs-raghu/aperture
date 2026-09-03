import type { Semester, SemesterId, SemesterListQuery, SemesterRepository } from "@aperture/education";

import { compareText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createSemesterMemoryRepository(
  collection: EntityCollection<Semester>,
): SemesterRepository {
  return createCrudMethods<Semester, SemesterId, SemesterListQuery>(
    collection,
    (entity, query) =>
      (query.programId === undefined || entity.programId === query.programId) &&
      (query.status === undefined || entity.status === query.status) &&
      (query.academicYear === undefined || entity.academicYear === query.academicYear),
    (left, right) => left.sequence - right.sequence || compareText(left.startsOn, right.startsOn),
  );
}
