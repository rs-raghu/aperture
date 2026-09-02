import type { CurrencyCode, FinancialStatus, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { FinancialAccount, FinancialAccountId, FinancialAccountType } from "./financial-account.types.js";

export interface CreateFinancialAccountInput { readonly ownerId: OwnerId; readonly name: string; readonly accountType: FinancialAccountType; readonly currency: CurrencyCode; }
export interface UpdateFinancialAccountInput { readonly name?: string; readonly accountType?: FinancialAccountType; readonly status?: FinancialStatus; }
export interface FinancialAccountListQuery extends OwnerQuery { readonly accountType?: FinancialAccountType; readonly status?: FinancialStatus; }
export interface FinancialAccountsByTypeQuery extends OwnerQuery { readonly accountType: FinancialAccountType; }

export declare function createFinancialAccount(input: CreateFinancialAccountInput): Promise<FinancialAccount>;
export declare function updateFinancialAccount(id: FinancialAccountId, ownerId: OwnerId, input: UpdateFinancialAccountInput): Promise<FinancialAccount>;
export declare function archiveFinancialAccount(id: FinancialAccountId, ownerId: OwnerId): Promise<FinancialAccount>;
export declare function closeFinancialAccount(id: FinancialAccountId, ownerId: OwnerId): Promise<FinancialAccount>;
export declare function getFinancialAccount(id: FinancialAccountId, ownerId: OwnerId): Promise<FinancialAccount | null>;
export declare function listFinancialAccounts(query: FinancialAccountListQuery): Promise<PageResult<FinancialAccount>>;
export declare function listFinancialAccountsByType(query: FinancialAccountsByTypeQuery): Promise<PageResult<FinancialAccount>>;
