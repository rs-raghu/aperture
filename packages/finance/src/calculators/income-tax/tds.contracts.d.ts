import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface TdsInput extends CalculatorInputContext {
  readonly paymentAmount: Money;
  readonly withholdingRate: Percentage;
}

export interface TdsResult {
  readonly estimatedWithholding: Money;
  readonly estimatedNetPayment: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rate uses a human percentage. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateTds(input: TdsInput): TdsResult;
