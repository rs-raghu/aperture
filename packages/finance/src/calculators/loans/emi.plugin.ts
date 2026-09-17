import { emiInputSchema, emiResultSchema } from "../../generated/finance.schemas.js";
import type { EmiInput, EmiResult } from "./emi.contracts.js";
import { calculatorExampleContext, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";
import { loanSchedule } from "./loan-plugin.helpers.js";

export const emiManifest = regulatedManifest({ id: "emi", title: "EMI", category: "loan", description: "Estimates a level monthly payment and reconciled amortization total.", formula: "reducing-balance annuity payment", isEstimate: true, disclaimers: ["The result excludes fees, insurance, penalties, and lender-specific rounding."] });
export function calculateEmi(input: EmiInput): EmiResult {
  const parsed = parseCalculatorInput(emiInputSchema, input);
  const schedule = loanSchedule(parsed.principal, parsed.annualInterestRate, parsed.annualRateKind, parsed.paymentCount);
  return parseCalculatorResult(emiResultSchema, { estimatedPeriodicPayment: schedule.payment, estimatedTotalPayment: schedule.totalPayment, estimatedInterest: schedule.totalInterest, metadata: resultMetadata(parsed, "emi", true, disclosureWarnings(...emiManifest.disclaimers)) });
}
const exampleInput = { ...calculatorExampleContext, principal: { amount: "1200", currency: "USD" }, annualInterestRate: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" }, annualRateKind: "nominal", paymentCount: 12 } as const;
export const emiPlugin = defineRegulatedPlugin({ manifest: emiManifest, inputSchema: emiInputSchema, outputSchema: emiResultSchema, calculate: calculateEmi, examples: [{ name: "zero-rate annual loan", input: exampleInput, expected: calculateEmi(exampleInput) }] });
