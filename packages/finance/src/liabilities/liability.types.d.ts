import type { FinancialMetadata, FinancialStatus, IsoDate } from "../finance.types.js";
import type { Money } from "../money.types.js";

export type LiabilityId = string;
export type LiabilityType = "loan" | "credit_card" | "mortgage" | "tax" | "other";

export interface Liability extends FinancialMetadata {
  readonly id: LiabilityId;
  readonly name: string;
  readonly liabilityType: LiabilityType;
  readonly outstandingBalance: Money;
  readonly valuedOn: IsoDate;
  readonly status: FinancialStatus;
}
