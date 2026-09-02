import type { DateRange } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { Percentage } from "../percentage.types.js";
import type { TransactionCategoryId } from "../categories/transaction-category.types.js";

export interface CashFlowSummary {
  readonly range: DateRange;
  readonly income: Money;
  readonly expenses: Money;
  readonly netCashFlow: Money;
}

export interface SavingsRateSummary {
  readonly range: DateRange;
  readonly savingsRate: Percentage;
}

export interface CategorySpendingSummary {
  readonly categoryId: TransactionCategoryId;
  readonly range: DateRange;
  readonly amount: Money;
}
