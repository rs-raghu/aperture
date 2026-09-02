import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateLiabilityInput, LiabilityListQuery, UpdateLiabilityInput } from "./liability.contracts.js";
import type { Liability, LiabilityId } from "./liability.types.js";
export interface LiabilityRepository extends CrudRepository<Liability, LiabilityId, CreateLiabilityInput, UpdateLiabilityInput, LiabilityListQuery> {}
