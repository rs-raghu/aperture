import type { DecimalString, IsoDateTime, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { HoldingId } from "../holdings/holding.types.js";
import type { Trade, TradeId, TradeType } from "./trade.types.js";
export interface RecordTradeInput { readonly ownerId: OwnerId; readonly holdingId: HoldingId; readonly tradeType: TradeType; readonly quantity: DecimalString; readonly unitPrice?: Money; readonly fees?: Money; readonly occurredAt: IsoDateTime; }
export interface UpdateTradeInput { readonly quantity?: DecimalString; readonly unitPrice?: Money; readonly fees?: Money; readonly occurredAt?: IsoDateTime; }
export interface TradeListQuery extends OwnerQuery { readonly holdingId?: HoldingId; }
export interface TradesByHoldingQuery extends OwnerQuery { readonly holdingId: HoldingId; }
export declare function recordTrade(input: RecordTradeInput): Promise<Trade>;
export declare function updateTrade(id: TradeId, ownerId: OwnerId, input: UpdateTradeInput): Promise<Trade>;
export declare function deleteTrade(id: TradeId, ownerId: OwnerId): Promise<void>;
export declare function getTrade(id: TradeId, ownerId: OwnerId): Promise<Trade | null>;
export declare function listTrades(query: TradeListQuery): Promise<PageResult<Trade>>;
export declare function listTradesByHolding(query: TradesByHoldingQuery): Promise<PageResult<Trade>>;
