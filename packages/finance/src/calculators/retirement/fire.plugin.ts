import { fireInputSchema, fireResultSchema } from "../../generated/finance.schemas.js";
import type { FireInput, FireResult } from "./fire.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { calculatorExampleContext, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRetirementPlugin, projectRetirementScenarios, retirementManifest, schemeWarnings } from "./retirement-plugin.helpers.js";

export const fireManifest = retirementManifest({
  id: "fire",
  title: "FIRE",
  description: "Compares caller-supplied financial-independence scenarios across inflation, returns, withdrawal rates, and longevity.",
  formula: "maximum of withdrawal-rate target and longevity cash-flow target, compared with projected corpus",
  governmentScheme: false,
  disclaimers: ["Results are mechanical estimates, not promises, guarantees, or personalized investment recommendations.", "Returns, inflation, withdrawal rates, and longevity can differ materially from every supplied scenario."],
});

export function calculateFire(input: FireInput): FireResult {
  const parsed = parseCalculatorInput(fireInputSchema, input);
  const scenarios = projectRetirementScenarios({
    annualNeed: parsed.annualExpenses,
    currentAge: parsed.currentAge,
    retirementAge: parsed.retirementAge,
    longevityAge: parsed.longevityAge,
    existingCorpus: parsed.existingCorpus,
    annualContribution: parsed.annualContribution,
    contributionTiming: parsed.contributionTiming,
    scenarios: parsed.scenarios,
  });
  const baseline = scenarios[0];
  if (!baseline) throw new FinanceCalculationError("calculation-failed", "A validated FIRE scenario was not available.");
  return parseCalculatorResult(fireResultSchema, {
    targetCorpus: baseline.targetCorpus,
    inflationAdjustedAnnualExpenses: baseline.inflationAdjustedAnnualNeed,
    projectedCorpus: baseline.projectedCorpus,
    fundingGap: baseline.fundingGap,
    scenarios,
    metadata: resultMetadata(parsed, "fire", true, schemeWarnings(parsed.sourceReferences.length, fireManifest)),
  });
}

const exampleInput = {
  ...calculatorExampleContext,
  annualExpenses: { amount: "100", currency: "USD" }, currentAge: 30, retirementAge: 32, longevityAge: 34,
  existingCorpus: { amount: "100", currency: "USD" }, annualContribution: { amount: "50", currency: "USD" }, contributionTiming: "end_of_period",
  scenarios: [{ name: "baseline", inflationRate: { value: "0", representation: "human_percentage" }, preRetirementReturn: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, preRetirementRateKind: "effective", postRetirementReturn: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, postRetirementRateKind: "effective", withdrawalRate: { value: "50", representation: "human_percentage" } }],
} as const;
export const firePlugin = defineRetirementPlugin({ manifest: fireManifest, inputSchema: fireInputSchema, outputSchema: fireResultSchema, calculate: calculateFire, examples: [{ name: "two-year baseline", input: exampleInput, expected: calculateFire(exampleInput) }] });
