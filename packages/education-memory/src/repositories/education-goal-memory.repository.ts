import type { EducationGoal, EducationGoalId, EducationGoalListQuery, EducationGoalRepository } from "@aperture/education";

import { compareOptionalText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createEducationGoalMemoryRepository(
  collection: EntityCollection<EducationGoal>,
): EducationGoalRepository {
  return createCrudMethods<EducationGoal, EducationGoalId, EducationGoalListQuery>(
    collection,
    (entity, query) =>
      (query.programId === undefined || entity.programId === query.programId) &&
      (query.semesterId === undefined || entity.semesterId === query.semesterId) &&
      (query.courseId === undefined || entity.courseId === query.courseId) &&
      (query.goalType === undefined || entity.goalType === query.goalType) &&
      (query.status === undefined || entity.status === query.status),
    (left, right) => compareOptionalText(left.targetDate, right.targetDate),
  );
}
