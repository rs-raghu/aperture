import type { FinancialFrequency, FinancialMetadata, FinancialStatus, IsoDate } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { FinancialAccountId } from "../accounts/financial-account.types.js";
import type { TransactionCategoryId } from "../categories/transaction-category.types.js";

export type RecurringTransactionId = string;

export interface RecurringTransaction extends FinancialMetadata {
  readonly id: RecurringTransactionId;
  readonly accountId: FinancialAccountId;
  readonly categoryId?: TransactionCategoryId;
  readonly description: string;
  readonly amount: Money;
  readonly frequency: FinancialFrequency;
  readonly nextOccurrenceOn: IsoDate;
  readonly status: FinancialStatus;
}
