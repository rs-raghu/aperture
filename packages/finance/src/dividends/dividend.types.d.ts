import type { FinancialMetadata, IsoDate } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { HoldingId } from "../holdings/holding.types.js";

export type DividendId = string;

export interface Dividend extends FinancialMetadata {
  readonly id: DividendId;
  readonly holdingId: HoldingId;
  readonly amount: Money;
  readonly paidOn: IsoDate;
}
