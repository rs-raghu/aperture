import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateFinancialAccountInput, FinancialAccountListQuery, UpdateFinancialAccountInput } from "./financial-account.contracts.js";
import type { FinancialAccount, FinancialAccountId } from "./financial-account.types.js";
export interface FinancialAccountRepository extends CrudRepository<FinancialAccount, FinancialAccountId, CreateFinancialAccountInput, UpdateFinancialAccountInput, FinancialAccountListQuery> {}
