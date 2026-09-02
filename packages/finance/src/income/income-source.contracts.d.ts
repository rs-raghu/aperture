import type { FinancialFrequency, FinancialStatus, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { IncomeSource, IncomeSourceId } from "./income-source.types.js";
export interface CreateIncomeSourceInput { readonly ownerId: OwnerId; readonly name: string; readonly expectedAmount?: Money; readonly frequency?: FinancialFrequency; }
export interface UpdateIncomeSourceInput { readonly name?: string; readonly expectedAmount?: Money; readonly frequency?: FinancialFrequency; readonly status?: FinancialStatus; }
export interface IncomeSourceListQuery extends OwnerQuery { readonly status?: FinancialStatus; }
export declare function createIncomeSource(input: CreateIncomeSourceInput): Promise<IncomeSource>;
export declare function updateIncomeSource(id: IncomeSourceId, ownerId: OwnerId, input: UpdateIncomeSourceInput): Promise<IncomeSource>;
export declare function archiveIncomeSource(id: IncomeSourceId, ownerId: OwnerId): Promise<IncomeSource>;
export declare function getIncomeSource(id: IncomeSourceId, ownerId: OwnerId): Promise<IncomeSource | null>;
export declare function listIncomeSources(query: IncomeSourceListQuery): Promise<PageResult<IncomeSource>>;
