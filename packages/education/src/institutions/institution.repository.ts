import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateInstitutionInput, InstitutionListQuery, UpdateInstitutionInput } from "./institution.contracts.js";
import type { Institution, InstitutionId } from "./institution.types.js";

export interface InstitutionRepository
  extends CrudRepository<Institution, InstitutionId, CreateInstitutionInput, UpdateInstitutionInput, InstitutionListQuery> {
  archive(id: InstitutionId, ownerId: string): Promise<Institution>;
}
