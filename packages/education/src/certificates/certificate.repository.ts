import type { CrudRepository } from "../repositories/repository.types.js";
import type { CertificateListQuery, CreateCertificateInput, UpdateCertificateInput } from "./certificate.contracts.js";
import type { Certificate, CertificateId } from "./certificate.types.js";

export interface CertificateRepository
  extends CrudRepository<Certificate, CertificateId, CreateCertificateInput, UpdateCertificateInput, CertificateListQuery> {}
