import type { IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { HoldingId } from "../holdings/holding.types.js";
import type { Dividend, DividendId } from "./dividend.types.js";
export interface RecordDividendInput { readonly ownerId: OwnerId; readonly holdingId: HoldingId; readonly amount: Money; readonly paidOn: IsoDate; }
export interface UpdateDividendInput { readonly amount?: Money; readonly paidOn?: IsoDate; }
export interface DividendListQuery extends OwnerQuery { readonly holdingId?: HoldingId; }
export interface DividendsByHoldingQuery extends OwnerQuery { readonly holdingId: HoldingId; }
export declare function recordDividend(input: RecordDividendInput): Promise<Dividend>;
export declare function updateDividend(id: DividendId, ownerId: OwnerId, input: UpdateDividendInput): Promise<Dividend>;
export declare function deleteDividend(id: DividendId, ownerId: OwnerId): Promise<void>;
export declare function getDividend(id: DividendId, ownerId: OwnerId): Promise<Dividend | null>;
export declare function listDividends(query: DividendListQuery): Promise<PageResult<Dividend>>;
export declare function listDividendsByHolding(query: DividendsByHoldingQuery): Promise<PageResult<Dividend>>;
