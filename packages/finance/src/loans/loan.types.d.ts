import type { FinancialMetadata, FinancialStatus, IsoDate } from "../finance.types.js";
import type { InterestRate } from "../interest-rate.types.js";
import type { Money } from "../money.types.js";

export type LoanId = string;

export interface Loan extends FinancialMetadata {
  readonly id: LoanId;
  readonly name: string;
  readonly principal: Money;
  readonly outstandingBalance: Money;
  readonly interestRate?: InterestRate;
  readonly startedOn?: IsoDate;
  readonly endsOn?: IsoDate;
  readonly status: FinancialStatus;
}
