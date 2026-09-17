import { futureValueWithContributions } from "../foundation/foundation.calculate.js";
import { apyInputSchema, apyResultSchema } from "../../generated/finance.schemas.js";
import type { ApyInput, ApyResult } from "./apy.contracts.js";
import { asMoney, calculatorExampleContext, decimal, ensureNonNegative, ensureSameCurrency, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRetirementPlugin, retirementManifest, schemeWarnings } from "./retirement-plugin.helpers.js";

export const apyManifest = retirementManifest({
  id: "apy",
  title: "APY",
  description: "Projects a pension value from an explicit balance, contribution schedule, and assumed return.",
  formula: "future value of current balance plus periodic contributions",
  governmentScheme: true,
  disclaimers: ["No current statutory contribution table, age rule, eligibility rule, or guaranteed pension amount is embedded.", "The projected value is an estimate and is not a promise, guarantee, or personalized recommendation."],
});

export function calculateApy(input: ApyInput): ApyResult {
  const parsed = parseCalculatorInput(apyInputSchema, input);
  const currency = ensureSameCurrency(parsed.currentBalance, parsed.periodicContribution);
  const current = decimal(parsed.currentBalance.amount);
  const contribution = decimal(parsed.periodicContribution.amount);
  ensureNonNegative(current, "Current balance");
  ensureNonNegative(contribution, "Periodic contribution");
  return parseCalculatorResult(apyResultSchema, {
    estimatedPensionValue: futureValueWithContributions({ startingValue: parsed.currentBalance, periodicAmount: parsed.periodicContribution, periodicRate: parsed.assumedRate, periodCount: parsed.contributionCount, timing: parsed.contributionTiming }),
    totalContributions: asMoney(contribution.times(parsed.contributionCount), currency),
    metadata: resultMetadata(parsed, "apy", true, schemeWarnings(parsed.sourceReferences.length, apyManifest, parsed.ruleVersion, parsed.ruleEffectiveOn)),
  });
}

const exampleInput = { ...calculatorExampleContext, currentBalance: { amount: "100", currency: "INR" }, periodicContribution: { amount: "10", currency: "INR" }, contributionCount: 2, assumedRate: { value: "0", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" }, contributionTiming: "end_of_period", ruleVersion: "caller-1", ruleEffectiveOn: "2026-01-01" } as const;
export const apyPlugin = defineRetirementPlugin({ manifest: apyManifest, inputSchema: apyInputSchema, outputSchema: apyResultSchema, calculate: calculateApy, examples: [{ name: "caller-supplied APY assumptions", input: exampleInput, expected: calculateApy(exampleInput) }] });
