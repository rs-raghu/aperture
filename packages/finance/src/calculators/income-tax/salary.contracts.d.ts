import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface NetSalaryInput extends CalculatorInputContext {
  readonly grossSalary: Money;
  readonly recordedDeductions: Money;
  readonly earnings: readonly { readonly name: string; readonly amount: Money }[];
  readonly deductions: readonly { readonly name: string; readonly amount: Money }[];
}

export interface NetSalaryResult {
  readonly estimatedNetSalary: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; itemized earnings and deductions must reconcile before the plug-in calculates net take-home. */
export declare function calculateNetSalary(input: NetSalaryInput): NetSalaryResult;
