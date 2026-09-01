import type { OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { Institution, InstitutionId, InstitutionStatus } from "./institution.types.js";

export interface CreateInstitutionInput {
  readonly ownerId: OwnerId;
  readonly name: string;
}

export interface UpdateInstitutionInput {
  readonly name?: string;
  readonly status?: InstitutionStatus;
}

export interface InstitutionListQuery extends OwnerQuery {
  readonly status?: InstitutionStatus;
}

export declare function createInstitution(input: CreateInstitutionInput): Promise<Institution>;
export declare function updateInstitution(id: InstitutionId, ownerId: OwnerId, input: UpdateInstitutionInput): Promise<Institution>;
export declare function archiveInstitution(id: InstitutionId, ownerId: OwnerId): Promise<Institution>;
export declare function getInstitution(id: InstitutionId, ownerId: OwnerId): Promise<Institution | null>;
export declare function listInstitutions(query: InstitutionListQuery): Promise<PageResult<Institution>>;
