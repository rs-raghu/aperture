import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface HomeLoanEmiInput extends CalculatorInputContext {
  readonly principal: Money;
  readonly annualInterestRate: InterestRate;
  readonly annualRateKind: "nominal" | "effective";
  readonly paymentCount: number;
}

export interface HomeLoanEmiResult {
  readonly estimatedPeriodicPayment: Money;
  readonly estimatedTotalPayment: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; the plug-in implements home-loan EMI amortization with an explicit annual-rate convention and disclosures. */
export declare function calculateHomeLoanEmi(input: HomeLoanEmiInput): HomeLoanEmiResult;
