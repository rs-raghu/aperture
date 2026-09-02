import type { FinancialMetadata, IsoDateTime } from "../finance.types.js";
import type { Money } from "../money.types.js";

export type MarketPriceId = string;

export interface MarketPrice extends FinancialMetadata {
  readonly id: MarketPriceId;
  readonly symbol: string;
  readonly unitPrice: Money;
  readonly observedAt: IsoDateTime;
}
