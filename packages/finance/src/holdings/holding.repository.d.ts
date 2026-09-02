import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateHoldingInput, HoldingListQuery, UpdateHoldingInput } from "./holding.contracts.js";
import type { Holding, HoldingId } from "./holding.types.js";
export interface HoldingRepository extends CrudRepository<Holding, HoldingId, CreateHoldingInput, UpdateHoldingInput, HoldingListQuery> {}
