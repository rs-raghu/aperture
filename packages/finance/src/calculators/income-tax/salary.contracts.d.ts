import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface NetSalaryInput extends CalculatorInputContext {
  readonly grossSalary: Money;
  readonly recordedDeductions: Money;
}

export interface NetSalaryResult {
  readonly estimatedNetSalary: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money inputs and output retain currency. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateNetSalary(input: NetSalaryInput): NetSalaryResult;
