import { compoundInterest } from "../foundation/foundation.calculate.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { compoundInterestInputSchema, compoundInterestResultSchema } from "../../generated/finance.schemas.js";
import type { CompoundInterestInput, CompoundInterestResult } from "./compound-interest.contracts.js";
import { calculatorExampleContext, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";

const periodsPerYear = { day: 365, week: 52, month: 12, quarter: 4, year: 1 } as const;
const compoundsPerYear = { daily: 365, monthly: 12, quarterly: 4, yearly: 1 } as const;
export const compoundInterestManifest = regulatedManifest({ id: "compound-interest", title: "Compound Interest", category: "loan", description: "Calculates compound interest with an explicit compounding frequency.", formula: "principal × (1 + rate/m)^(m×periods)", isEstimate: true, disclaimers: ["Compounding count must match the rate period and named compounding frequency."] });
export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const parsed = parseCalculatorInput(compoundInterestInputSchema, input);
  if (parsed.interestRate.period === "custom") throw new FinanceCalculationError("unsupported-rate-convention", "Custom periods cannot derive a compounding count.");
  const annualPeriods = periodsPerYear[parsed.interestRate.period];
  const annualCompounds = compoundsPerYear[parsed.interestRate.compoundingFrequency];
  const expectedCount = annualCompounds / annualPeriods;
  if (!Number.isInteger(expectedCount) || parsed.compoundingCount !== expectedCount) throw new FinanceCalculationError("invalid-calculation-input", "Compounding count does not match the named frequency and rate period.");
  const result = compoundInterest({ principal: parsed.principal, rate: parsed.interestRate, periodCount: parsed.periodCount });
  return parseCalculatorResult(compoundInterestResultSchema, { estimatedInterest: result.interest, estimatedTotal: result.total, metadata: resultMetadata(parsed, "compound-interest", true, disclosureWarnings(...compoundInterestManifest.disclaimers)) });
}
const exampleInput = { ...calculatorExampleContext, principal: { amount: "1000", currency: "USD" }, interestRate: { value: "12", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" }, periodCount: 1, compoundingCount: 12 } as const;
export const compoundInterestPlugin = defineRegulatedPlugin({ manifest: compoundInterestManifest, inputSchema: compoundInterestInputSchema, outputSchema: compoundInterestResultSchema, calculate: calculateCompoundInterest, examples: [{ name: "monthly compounding", input: exampleInput, expected: calculateCompoundInterest(exampleInput) }] });
