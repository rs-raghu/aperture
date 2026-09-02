import type { DecimalString, FinancialStatus, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { InvestmentAccountId } from "../investments/investment-account.types.js";
import type { Holding, HoldingId } from "./holding.types.js";
export interface CreateHoldingInput { readonly ownerId: OwnerId; readonly investmentAccountId: InvestmentAccountId; readonly symbol: string; readonly name: string; readonly quantity: DecimalString; readonly averageUnitCost?: Money; }
export interface UpdateHoldingInput { readonly name?: string; readonly quantity?: DecimalString; readonly averageUnitCost?: Money; readonly status?: FinancialStatus; }
export interface HoldingListQuery extends OwnerQuery { readonly investmentAccountId?: InvestmentAccountId; }
export interface HoldingsByInvestmentAccountQuery extends OwnerQuery { readonly investmentAccountId: InvestmentAccountId; }
export declare function createHolding(input: CreateHoldingInput): Promise<Holding>;
export declare function updateHolding(id: HoldingId, ownerId: OwnerId, input: UpdateHoldingInput): Promise<Holding>;
export declare function archiveHolding(id: HoldingId, ownerId: OwnerId): Promise<Holding>;
export declare function getHolding(id: HoldingId, ownerId: OwnerId): Promise<Holding | null>;
export declare function listHoldings(query: HoldingListQuery): Promise<PageResult<Holding>>;
export declare function listHoldingsByInvestmentAccount(query: HoldingsByInvestmentAccountQuery): Promise<PageResult<Holding>>;
