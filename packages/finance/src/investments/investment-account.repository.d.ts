import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateInvestmentAccountInput, InvestmentAccountListQuery, UpdateInvestmentAccountInput } from "./investment-account.contracts.js";
import type { InvestmentAccount, InvestmentAccountId } from "./investment-account.types.js";
export interface InvestmentAccountRepository extends CrudRepository<InvestmentAccount, InvestmentAccountId, CreateInvestmentAccountInput, UpdateInvestmentAccountInput, InvestmentAccountListQuery> {}
