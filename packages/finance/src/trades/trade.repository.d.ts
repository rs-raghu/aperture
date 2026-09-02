import type { CrudRepository } from "../repositories/repository.types.js";
import type { RecordTradeInput, TradeListQuery, UpdateTradeInput } from "./trade.contracts.js";
import type { Trade, TradeId } from "./trade.types.js";
export interface TradeRepository extends CrudRepository<Trade, TradeId, RecordTradeInput, UpdateTradeInput, TradeListQuery> {}
