import type { DecimalString, FinancialMetadata, IsoDateTime } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { HoldingId } from "../holdings/holding.types.js";

export type TradeId = string;
export type TradeType = "buy" | "sell" | "bonus" | "split" | "transfer" | "adjustment";

export interface Trade extends FinancialMetadata {
  readonly id: TradeId;
  readonly holdingId: HoldingId;
  readonly tradeType: TradeType;
  readonly quantity: DecimalString;
  readonly unitPrice?: Money;
  readonly fees?: Money;
  readonly occurredAt: IsoDateTime;
}
