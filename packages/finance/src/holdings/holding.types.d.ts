import type { DecimalString, FinancialMetadata, FinancialStatus } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { InvestmentAccountId } from "../investments/investment-account.types.js";

export type HoldingId = string;

export interface Holding extends FinancialMetadata {
  readonly id: HoldingId;
  readonly investmentAccountId: InvestmentAccountId;
  readonly symbol: string;
  readonly name: string;
  readonly quantity: DecimalString;
  readonly averageUnitCost?: Money;
  readonly status: FinancialStatus;
}
