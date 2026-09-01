import type { EntityMetadata, IsoDateString } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { InstitutionId } from "../institutions/institution.types.js";
import type { ProgramId } from "../programs/program.types.js";

export type CertificateId = string;
export type CertificateStatus = "planned" | "earned" | "expired";

export interface Certificate extends EntityMetadata {
  readonly id: CertificateId;
  readonly institutionId?: InstitutionId;
  readonly programId?: ProgramId;
  readonly courseId?: CourseId;
  readonly title: string;
  readonly status: CertificateStatus;
  readonly issuedOn?: IsoDateString;
  readonly expiresOn?: IsoDateString;
}
