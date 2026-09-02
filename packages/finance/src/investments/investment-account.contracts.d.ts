import type { CurrencyCode, FinancialStatus, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { FinancialAccountId } from "../accounts/financial-account.types.js";
import type { InvestmentAccount, InvestmentAccountId } from "./investment-account.types.js";
export interface CreateInvestmentAccountInput { readonly ownerId: OwnerId; readonly financialAccountId?: FinancialAccountId; readonly name: string; readonly currency: CurrencyCode; }
export interface UpdateInvestmentAccountInput { readonly name?: string; readonly status?: FinancialStatus; }
export interface InvestmentAccountListQuery extends OwnerQuery { readonly status?: FinancialStatus; }
export declare function createInvestmentAccount(input: CreateInvestmentAccountInput): Promise<InvestmentAccount>;
export declare function updateInvestmentAccount(id: InvestmentAccountId, ownerId: OwnerId, input: UpdateInvestmentAccountInput): Promise<InvestmentAccount>;
export declare function archiveInvestmentAccount(id: InvestmentAccountId, ownerId: OwnerId): Promise<InvestmentAccount>;
export declare function getInvestmentAccount(id: InvestmentAccountId, ownerId: OwnerId): Promise<InvestmentAccount | null>;
export declare function listInvestmentAccounts(query: InvestmentAccountListQuery): Promise<PageResult<InvestmentAccount>>;
