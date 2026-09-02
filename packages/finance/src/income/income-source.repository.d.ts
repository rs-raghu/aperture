import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateIncomeSourceInput, IncomeSourceListQuery, UpdateIncomeSourceInput } from "./income-source.contracts.js";
import type { IncomeSource, IncomeSourceId } from "./income-source.types.js";
export interface IncomeSourceRepository extends CrudRepository<IncomeSource, IncomeSourceId, CreateIncomeSourceInput, UpdateIncomeSourceInput, IncomeSourceListQuery> {}
