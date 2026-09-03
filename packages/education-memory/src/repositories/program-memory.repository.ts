import type { AcademicProgram, ProgramId, ProgramListQuery, ProgramRepository } from "@aperture/education";

import { compareText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createProgramMemoryRepository(
  collection: EntityCollection<AcademicProgram>,
): ProgramRepository {
  return createCrudMethods<AcademicProgram, ProgramId, ProgramListQuery>(
    collection,
    (entity, query) =>
      (query.institutionId === undefined || entity.institutionId === query.institutionId) &&
      (query.programType === undefined || entity.programType === query.programType) &&
      (query.status === undefined || entity.status === query.status),
    (left, right) => compareText(left.name, right.name),
  );
}
