import type { FinancialMetadata, FinancialStatus, IsoDate } from "../finance.types.js";
import type { Money } from "../money.types.js";

export type FinancialGoalId = string;

export interface FinancialGoal extends FinancialMetadata {
  readonly id: FinancialGoalId;
  readonly name: string;
  readonly targetAmount: Money;
  readonly recordedProgressAmount?: Money;
  readonly targetDate?: IsoDate;
  readonly status: FinancialStatus;
}
