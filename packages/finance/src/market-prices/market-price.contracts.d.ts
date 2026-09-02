import type { IsoDateTime, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { MarketPrice, MarketPriceId } from "./market-price.types.js";
export interface RecordMarketPriceInput { readonly ownerId: OwnerId; readonly symbol: string; readonly unitPrice: Money; readonly observedAt: IsoDateTime; }
export interface UpdateMarketPriceInput { readonly unitPrice?: Money; readonly observedAt?: IsoDateTime; }
export interface MarketPriceListQuery extends OwnerQuery { readonly symbol?: string; }
export declare function recordMarketPrice(input: RecordMarketPriceInput): Promise<MarketPrice>;
export declare function updateMarketPrice(id: MarketPriceId, ownerId: OwnerId, input: UpdateMarketPriceInput): Promise<MarketPrice>;
export declare function deleteMarketPrice(id: MarketPriceId, ownerId: OwnerId): Promise<void>;
export declare function getLatestMarketPrice(symbol: string, ownerId: OwnerId): Promise<MarketPrice | null>;
export declare function listMarketPrices(query: MarketPriceListQuery): Promise<PageResult<MarketPrice>>;
