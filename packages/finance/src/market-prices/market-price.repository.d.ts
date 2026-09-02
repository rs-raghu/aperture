import type { CrudRepository } from "../repositories/repository.types.js";
import type { MarketPriceListQuery, RecordMarketPriceInput, UpdateMarketPriceInput } from "./market-price.contracts.js";
import type { MarketPrice, MarketPriceId } from "./market-price.types.js";
export interface MarketPriceRepository extends CrudRepository<MarketPrice, MarketPriceId, RecordMarketPriceInput, UpdateMarketPriceInput, MarketPriceListQuery> {}
