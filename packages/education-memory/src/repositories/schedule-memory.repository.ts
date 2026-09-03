import type { ScheduleEntry, ScheduleEntryId, ScheduleEntryListQuery, ScheduleRepository } from "@aperture/education";

import { compareText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createScheduleMemoryRepository(
  collection: EntityCollection<ScheduleEntry>,
): ScheduleRepository {
  return createCrudMethods<ScheduleEntry, ScheduleEntryId, ScheduleEntryListQuery>(
    collection,
    (entity, query) =>
      (query.courseId === undefined || entity.courseId === query.courseId) &&
      (query.entryType === undefined || entity.entryType === query.entryType) &&
      (query.status === undefined || entity.status === query.status) &&
      (query.startsBefore === undefined || entity.startsAt <= query.startsBefore) &&
      (query.endsAfter === undefined || entity.endsAt >= query.endsAfter),
    (left, right) => compareText(left.startsAt, right.startsAt),
  );
}
