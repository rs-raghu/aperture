import type { CrudRepository } from "../repositories/repository.types.js";
import type { RunningSplitListQuery } from "./running-split.contracts.js";
import type { RunningSplit, RunningSplitId } from "./running-split.types.js";

export interface RunningSplitRepository
  extends CrudRepository<RunningSplit, RunningSplitId, RunningSplitListQuery> {}
