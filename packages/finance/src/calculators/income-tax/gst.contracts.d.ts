import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface GstInput extends CalculatorInputContext {
  readonly amount: Money;
  readonly taxRate: Percentage;
  readonly pricingMode: "exclusive" | "inclusive";
}

export interface GstResult {
  readonly estimatedTax: Money;
  readonly estimatedNetAmount: Money;
  readonly estimatedGrossAmount: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; the plug-in calculates inclusive or exclusive GST from a caller-supplied rate. */
export declare function calculateGst(input: GstInput): GstResult;
