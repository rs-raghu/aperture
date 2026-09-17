import { retirementCorpusInputSchema, retirementCorpusResultSchema } from "../../generated/finance.schemas.js";
import type { RetirementCorpusInput, RetirementCorpusResult } from "./retirement-corpus.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { calculatorExampleContext, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRetirementPlugin, projectRetirementScenarios, retirementManifest, schemeWarnings } from "./retirement-plugin.helpers.js";

export const retirementCorpusManifest = retirementManifest({
  id: "retirement-corpus",
  title: "Retirement Corpus",
  description: "Compares desired retirement-income scenarios with a projected contribution schedule.",
  formula: "maximum of withdrawal-rate target and longevity cash-flow target, compared with projected savings",
  governmentScheme: false,
  disclaimers: ["Results are estimates, not promises, guarantees, or personalized investment recommendations.", "The result excludes taxes, fees, sequence risk, and unmodeled changes in income or spending."],
});

export function calculateRetirementCorpus(input: RetirementCorpusInput): RetirementCorpusResult {
  const parsed = parseCalculatorInput(retirementCorpusInputSchema, input);
  const scenarios = projectRetirementScenarios({
    annualNeed: parsed.desiredAnnualIncome,
    currentAge: parsed.currentAge,
    retirementAge: parsed.retirementAge,
    longevityAge: parsed.longevityAge,
    existingCorpus: parsed.currentSavings,
    annualContribution: parsed.annualContribution,
    contributionTiming: parsed.contributionTiming,
    scenarios: parsed.scenarios,
  });
  const baseline = scenarios[0];
  if (!baseline) throw new FinanceCalculationError("calculation-failed", "A validated retirement scenario was not available.");
  return parseCalculatorResult(retirementCorpusResultSchema, {
    estimatedCorpus: baseline.targetCorpus,
    projectedSavings: baseline.projectedCorpus,
    fundingGap: baseline.fundingGap,
    scenarios,
    metadata: resultMetadata(parsed, "retirement-corpus", true, schemeWarnings(parsed.sourceReferences.length, retirementCorpusManifest)),
  });
}

const exampleInput = {
  ...calculatorExampleContext,
  currentSavings: { amount: "100", currency: "USD" }, annualContribution: { amount: "50", currency: "USD" }, contributionTiming: "end_of_period",
  desiredAnnualIncome: { amount: "100", currency: "USD" }, currentAge: 30, retirementAge: 32, longevityAge: 34,
  scenarios: [{ name: "baseline", inflationRate: { value: "0", representation: "human_percentage" }, preRetirementReturn: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, preRetirementRateKind: "effective", postRetirementReturn: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, postRetirementRateKind: "effective", withdrawalRate: { value: "50", representation: "human_percentage" } }],
} as const;
export const retirementCorpusPlugin = defineRetirementPlugin({ manifest: retirementCorpusManifest, inputSchema: retirementCorpusInputSchema, outputSchema: retirementCorpusResultSchema, calculate: calculateRetirementCorpus, examples: [{ name: "two-year income horizon", input: exampleInput, expected: calculateRetirementCorpus(exampleInput) }] });
