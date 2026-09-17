import { gratuityInputSchema, gratuityResultSchema } from "../../generated/finance.schemas.js";
import type { GratuityInput, GratuityResult } from "./gratuity.contracts.js";
import { asMoney, calculatorExampleContext, decimal, ensureNonNegative, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { boundedPercentage, defineRetirementPlugin, retirementManifest, schemeWarnings } from "./retirement-plugin.helpers.js";

export const gratuityManifest = retirementManifest({
  id: "gratuity",
  title: "Gratuity",
  description: "Estimates a benefit using eligible salary, service, and an explicit effective-dated benefit factor.",
  formula: "eligible salary × years of service × benefit factor",
  governmentScheme: true,
  disclaimers: ["No current eligibility threshold, service-rounding rule, salary definition, ceiling, or tax rule is embedded.", "The estimated benefit is not a legal determination, promise, guarantee, or personalized recommendation."],
});

export function calculateGratuity(input: GratuityInput): GratuityResult {
  const parsed = parseCalculatorInput(gratuityInputSchema, input);
  const salary = decimal(parsed.eligibleSalary.amount);
  ensureNonNegative(salary, "Eligible salary");
  const factor = boundedPercentage(parsed.benefitFactor, "Benefit factor");
  return parseCalculatorResult(gratuityResultSchema, {
    estimatedBenefit: asMoney(salary.times(parsed.yearsOfService).times(factor), parsed.eligibleSalary.currency),
    metadata: resultMetadata(parsed, "gratuity", true, schemeWarnings(parsed.sourceReferences.length, gratuityManifest, parsed.ruleVersion, parsed.ruleEffectiveOn)),
  });
}

const exampleInput = { ...calculatorExampleContext, eligibleSalary: { amount: "1000", currency: "INR" }, yearsOfService: 2, benefitFactor: { value: "5", representation: "human_percentage" }, ruleVersion: "caller-1", ruleEffectiveOn: "2026-01-01" } as const;
export const gratuityPlugin = defineRetirementPlugin({ manifest: gratuityManifest, inputSchema: gratuityInputSchema, outputSchema: gratuityResultSchema, calculate: calculateGratuity, examples: [{ name: "caller-supplied gratuity factor", input: exampleInput, expected: calculateGratuity(exampleInput) }] });
