import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface IncomeTaxInput extends CalculatorInputContext {
  readonly taxableIncome: Money;
  readonly financialYear: string;
  readonly jurisdiction: string;
}

export interface IncomeTaxResult {
  readonly estimatedTax: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; year and jurisdiction identify external rule context. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult;
