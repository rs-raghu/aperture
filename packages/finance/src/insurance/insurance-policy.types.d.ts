import type { FinancialFrequency, FinancialMetadata, FinancialStatus, IsoDate } from "../finance.types.js";
import type { Money } from "../money.types.js";

export type InsurancePolicyId = string;

export interface InsurancePolicy extends FinancialMetadata {
  readonly id: InsurancePolicyId;
  readonly name: string;
  readonly policyType: string;
  readonly premium?: Money;
  readonly premiumFrequency?: FinancialFrequency;
  readonly coverageAmount?: Money;
  readonly startsOn?: IsoDate;
  readonly renewsOn?: IsoDate;
  readonly status: FinancialStatus;
}
