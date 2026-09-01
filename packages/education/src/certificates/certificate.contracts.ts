import type { IsoDateString, OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { InstitutionId } from "../institutions/institution.types.js";
import type { ProgramId } from "../programs/program.types.js";
import type { Certificate, CertificateId, CertificateStatus } from "./certificate.types.js";

export interface CreateCertificateInput {
  readonly ownerId: OwnerId;
  readonly institutionId?: InstitutionId;
  readonly programId?: ProgramId;
  readonly courseId?: CourseId;
  readonly title: string;
  readonly status: CertificateStatus;
  readonly issuedOn?: IsoDateString;
  readonly expiresOn?: IsoDateString;
}

export interface UpdateCertificateInput {
  readonly title?: string;
  readonly status?: CertificateStatus;
  readonly issuedOn?: IsoDateString;
  readonly expiresOn?: IsoDateString;
}

export interface CertificateListQuery extends OwnerQuery {
  readonly institutionId?: InstitutionId;
  readonly programId?: ProgramId;
  readonly status?: CertificateStatus;
}

export declare function createCertificate(input: CreateCertificateInput): Promise<Certificate>;
export declare function updateCertificate(id: CertificateId, ownerId: OwnerId, input: UpdateCertificateInput): Promise<Certificate>;
export declare function deleteCertificate(id: CertificateId, ownerId: OwnerId): Promise<void>;
export declare function getCertificate(id: CertificateId, ownerId: OwnerId): Promise<Certificate | null>;
export declare function listCertificates(query: CertificateListQuery): Promise<PageResult<Certificate>>;
