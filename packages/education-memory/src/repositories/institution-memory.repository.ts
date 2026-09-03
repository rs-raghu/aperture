import type { Institution, InstitutionId, InstitutionListQuery, InstitutionRepository } from "@aperture/education";

import { compareText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createInstitutionMemoryRepository(
  collection: EntityCollection<Institution>,
): InstitutionRepository {
  return createCrudMethods<Institution, InstitutionId, InstitutionListQuery>(
    collection,
    (entity, query) =>
      (query.type === undefined || entity.type === query.type) &&
      (query.status === undefined || entity.status === query.status) &&
      (query.search === undefined || `${entity.name} ${entity.shortName ?? ""}`.toLowerCase().includes(query.search.toLowerCase())),
    (left, right) => compareText(left.name, right.name),
  );
}
