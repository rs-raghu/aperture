import type { CrudRepository } from "../repositories/repository.types.js";
import type { DividendListQuery, RecordDividendInput, UpdateDividendInput } from "./dividend.contracts.js";
import type { Dividend, DividendId } from "./dividend.types.js";
export interface DividendRepository extends CrudRepository<Dividend, DividendId, RecordDividendInput, UpdateDividendInput, DividendListQuery> {}
