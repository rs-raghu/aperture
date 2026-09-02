import type { FinancialMetadata } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { TransactionCategoryId } from "../categories/transaction-category.types.js";
import type { BudgetId } from "./budget.types.js";

export type BudgetLineId = string;

export interface BudgetLine extends FinancialMetadata {
  readonly id: BudgetLineId;
  readonly budgetId: BudgetId;
  readonly categoryId: TransactionCategoryId;
  readonly allocatedAmount: Money;
}
