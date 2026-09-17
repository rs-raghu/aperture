import { simpleInterest } from "../foundation/foundation.calculate.js";
import { simpleInterestInputSchema, simpleInterestResultSchema } from "../../generated/finance.schemas.js";
import type { SimpleInterestInput, SimpleInterestResult } from "./simple-interest.contracts.js";
import { calculatorExampleContext, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";

export const simpleInterestManifest = regulatedManifest({ id: "simple-interest", title: "Simple Interest", category: "loan", description: "Calculates simple interest for an explicitly stated rate period.", formula: "principal × rate × periods", isEstimate: true, disclaimers: ["The stated rate applies once per input period; no rate conversion is performed."] });
export function calculateSimpleInterest(input: SimpleInterestInput): SimpleInterestResult {
  const parsed = parseCalculatorInput(simpleInterestInputSchema, input);
  const result = simpleInterest({ principal: parsed.principal, rate: parsed.interestRate, periodCount: parsed.periodCount });
  return parseCalculatorResult(simpleInterestResultSchema, { estimatedInterest: result.interest, estimatedTotal: result.total, metadata: resultMetadata(parsed, "simple-interest", true, disclosureWarnings(...simpleInterestManifest.disclaimers)) });
}
const exampleInput = { ...calculatorExampleContext, principal: { amount: "1000", currency: "USD" }, interestRate: { value: "5", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, periodCount: 2 } as const;
export const simpleInterestPlugin = defineRegulatedPlugin({ manifest: simpleInterestManifest, inputSchema: simpleInterestInputSchema, outputSchema: simpleInterestResultSchema, calculate: calculateSimpleInterest, examples: [{ name: "two annual periods", input: exampleInput, expected: calculateSimpleInterest(exampleInput) }] });
