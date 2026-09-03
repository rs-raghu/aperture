import type { CrudRepository } from "../repositories/repository.types.js";
import type { InstitutionListQuery } from "./institution.types.js";
import type { Institution, InstitutionId } from "./institution.types.js";

export interface InstitutionRepository
  extends CrudRepository<Institution, InstitutionId, InstitutionListQuery> {}
