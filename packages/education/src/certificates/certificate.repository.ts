import type { CrudRepository } from "../repositories/repository.types.js";
import type { Certificate, CertificateId, CertificateListQuery } from "./certificate.types.js";

export interface CertificateRepository
  extends CrudRepository<Certificate, CertificateId, CertificateListQuery> {}
