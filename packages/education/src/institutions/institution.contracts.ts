import type { OwnerId, PageResult } from "../education.types.js";
import type { CreateInstitutionInput, Institution, InstitutionId, InstitutionListQuery, UpdateInstitutionInput } from "./institution.types.js";
export type { CreateInstitutionInput, InstitutionListQuery, UpdateInstitutionInput } from "./institution.types.js";
export declare function createInstitution(input: CreateInstitutionInput): Promise<Institution>;
export declare function updateInstitution(id: InstitutionId, ownerId: OwnerId, input: UpdateInstitutionInput): Promise<Institution>;
export declare function archiveInstitution(id: InstitutionId, ownerId: OwnerId): Promise<Institution>;
export declare function getInstitution(id: InstitutionId, ownerId: OwnerId): Promise<Institution | null>;
export declare function listInstitutions(query: InstitutionListQuery): Promise<PageResult<Institution>>;
