import type { OwnerId, PageResult } from "../education.types.js";
import type { Certificate, CertificateId, CertificateListQuery, CreateCertificateInput, UpdateCertificateInput } from "./certificate.types.js";
export type { CertificateListQuery, CreateCertificateInput, UpdateCertificateInput } from "./certificate.types.js";
export declare function createCertificate(input: CreateCertificateInput): Promise<Certificate>;
export declare function updateCertificate(id: CertificateId, ownerId: OwnerId, input: UpdateCertificateInput): Promise<Certificate>;
export declare function deleteCertificate(id: CertificateId, ownerId: OwnerId): Promise<void>;
export declare function getCertificate(id: CertificateId, ownerId: OwnerId): Promise<Certificate | null>;
export declare function listCertificates(query: CertificateListQuery): Promise<PageResult<Certificate>>;
