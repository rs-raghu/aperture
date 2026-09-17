import { homeLoanEmiInputSchema, homeLoanEmiResultSchema } from "../../generated/finance.schemas.js";
import type { HomeLoanEmiInput, HomeLoanEmiResult } from "./home-loan-emi.contracts.js";
import { calculatorExampleContext, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";
import { loanSchedule } from "./loan-plugin.helpers.js";

export const homeLoanEmiManifest = regulatedManifest({ id: "home-loan-emi", title: "Home Loan EMI", category: "loan", description: "Estimates a home-loan payment from explicit annual-rate conventions.", formula: "reducing-balance annuity payment", isEstimate: true, disclaimers: ["The result excludes property charges, insurance, fees, subsidies, and lender-specific rules."] });
export function calculateHomeLoanEmi(input: HomeLoanEmiInput): HomeLoanEmiResult {
  const parsed = parseCalculatorInput(homeLoanEmiInputSchema, input);
  const schedule = loanSchedule(parsed.principal, parsed.annualInterestRate, parsed.annualRateKind, parsed.paymentCount);
  return parseCalculatorResult(homeLoanEmiResultSchema, { estimatedPeriodicPayment: schedule.payment, estimatedTotalPayment: schedule.totalPayment, metadata: resultMetadata(parsed, "home-loan-emi", true, disclosureWarnings(...homeLoanEmiManifest.disclaimers)) });
}
const exampleInput = { ...calculatorExampleContext, principal: { amount: "1200", currency: "USD" }, annualInterestRate: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" }, annualRateKind: "nominal", paymentCount: 12 } as const;
export const homeLoanEmiPlugin = defineRegulatedPlugin({ manifest: homeLoanEmiManifest, inputSchema: homeLoanEmiInputSchema, outputSchema: homeLoanEmiResultSchema, calculate: calculateHomeLoanEmi, examples: [{ name: "zero-rate illustration", input: exampleInput, expected: calculateHomeLoanEmi(exampleInput) }] });
