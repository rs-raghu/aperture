import type { Certificate, CertificateId, CertificateListQuery, CertificateRepository } from "@aperture/education";

import { compareOptionalText, createCrudMethods, type EntityCollection } from "../store/entity-collection.js";

export function createCertificateMemoryRepository(
  collection: EntityCollection<Certificate>,
): CertificateRepository {
  return createCrudMethods<Certificate, CertificateId, CertificateListQuery>(
    collection,
    (entity, query) =>
      (query.institutionId === undefined || entity.institutionId === query.institutionId) &&
      (query.programId === undefined || entity.programId === query.programId) &&
      (query.courseId === undefined || entity.courseId === query.courseId) &&
      (query.status === undefined || entity.status === query.status) &&
      (query.issuingOrganization === undefined || entity.issuingOrganization === query.issuingOrganization),
    (left, right) => compareOptionalText(left.issuedOn, right.issuedOn),
  );
}
