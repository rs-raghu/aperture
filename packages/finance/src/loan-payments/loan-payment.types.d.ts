import type { FinancialMetadata, IsoDate } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { LoanId } from "../loans/loan.types.js";

export type LoanPaymentId = string;

export interface LoanPayment extends FinancialMetadata {
  readonly id: LoanPaymentId;
  readonly loanId: LoanId;
  readonly amount: Money;
  readonly principalComponent?: Money;
  readonly interestComponent?: Money;
  readonly paidOn: IsoDate;
}
