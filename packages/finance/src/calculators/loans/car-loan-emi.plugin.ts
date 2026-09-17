import { carLoanEmiInputSchema, carLoanEmiResultSchema } from "../../generated/finance.schemas.js";
import type { CarLoanEmiInput, CarLoanEmiResult } from "./car-loan-emi.contracts.js";
import { calculatorExampleContext, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";
import { loanSchedule } from "./loan-plugin.helpers.js";

export const carLoanEmiManifest = regulatedManifest({ id: "car-loan-emi", title: "Car Loan EMI", category: "loan", description: "Estimates a car-loan payment from explicit annual-rate conventions.", formula: "reducing-balance annuity payment", isEstimate: true, disclaimers: ["The result excludes fees, insurance, balloon payments, and lender-specific rules."] });
export function calculateCarLoanEmi(input: CarLoanEmiInput): CarLoanEmiResult {
  const parsed = parseCalculatorInput(carLoanEmiInputSchema, input);
  const schedule = loanSchedule(parsed.principal, parsed.annualInterestRate, parsed.annualRateKind, parsed.paymentCount);
  return parseCalculatorResult(carLoanEmiResultSchema, { estimatedPeriodicPayment: schedule.payment, estimatedTotalPayment: schedule.totalPayment, metadata: resultMetadata(parsed, "car-loan-emi", true, disclosureWarnings(...carLoanEmiManifest.disclaimers)) });
}
const exampleInput = { ...calculatorExampleContext, principal: { amount: "1200", currency: "USD" }, annualInterestRate: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" }, annualRateKind: "nominal", paymentCount: 12 } as const;
export const carLoanEmiPlugin = defineRegulatedPlugin({ manifest: carLoanEmiManifest, inputSchema: carLoanEmiInputSchema, outputSchema: carLoanEmiResultSchema, calculate: calculateCarLoanEmi, examples: [{ name: "zero-rate illustration", input: exampleInput, expected: calculateCarLoanEmi(exampleInput) }] });
