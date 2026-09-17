import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface BrokerageInput extends CalculatorInputContext {
  readonly tradeValue: Money;
  readonly brokerageRate: Percentage;
  readonly additionalCharges: Money;
}

export interface BrokerageResult {
  readonly estimatedCharges: Money;
  readonly estimatedNetAmount: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rates use human percentages. Output is an estimate with explicit version, assumptions, and sources. */
export declare function calculateBrokerage(input: BrokerageInput): BrokerageResult;
