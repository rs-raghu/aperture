import type { DecimalString, FiscalYearId, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface IncomeTaxInput extends CalculatorInputContext {
  readonly taxableIncome: Money;
  readonly deductions: Money;
  readonly financialYear: FiscalYearId;
  readonly jurisdiction: string;
  readonly taxRuleVersion: string;
  readonly ruleEffectiveOn: IsoDate;
  readonly slabs: readonly {
    readonly startsAt: Money;
    readonly endsAt?: Money;
    readonly rate: Percentage;
  }[];
  readonly rebateThreshold: Money;
  readonly rebateAmount: Money;
  readonly cessRate: Percentage;
  readonly surchargeRate: Percentage;
}

export interface IncomeTaxResult {
  readonly estimatedTax: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; the plug-in evaluates caller-supplied, effective-dated rules and reports an estimate with disclosures. */
export declare function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult;
