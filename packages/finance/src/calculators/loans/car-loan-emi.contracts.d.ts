import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface CarLoanEmiInput extends CalculatorInputContext {
  readonly principal: Money;
  readonly annualInterestRate: InterestRate;
  readonly annualRateKind: "nominal" | "effective";
  readonly paymentCount: number;
}

export interface CarLoanEmiResult {
  readonly estimatedPeriodicPayment: Money;
  readonly estimatedTotalPayment: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; the plug-in implements car-loan EMI amortization with an explicit annual-rate convention and disclosures. */
export declare function calculateCarLoanEmi(input: CarLoanEmiInput): CarLoanEmiResult;
