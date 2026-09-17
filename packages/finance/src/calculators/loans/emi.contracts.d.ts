import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface EmiInput extends CalculatorInputContext {
  readonly principal: Money;
  readonly annualInterestRate: InterestRate;
  readonly annualRateKind: "nominal" | "effective";
  readonly paymentCount: number;
}

export interface EmiResult {
  readonly estimatedPeriodicPayment: Money;
  readonly estimatedTotalPayment: Money;
  readonly estimatedInterest: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; the plug-in implements EMI amortization with an explicit annual-rate convention and reconciled final payment. */
export declare function calculateEmi(input: EmiInput): EmiResult;
