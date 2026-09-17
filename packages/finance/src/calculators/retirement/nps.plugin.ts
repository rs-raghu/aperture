import { futureValueWithContributions } from "../foundation/foundation.calculate.js";
import { npsInputSchema, npsResultSchema } from "../../generated/finance.schemas.js";
import type { NpsInput, NpsResult } from "./nps.contracts.js";
import { asMoney, calculatorExampleContext, decimal, ensureNonNegative, ensureSameCurrency, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { boundedPercentage, defineRetirementPlugin, retirementManifest, schemeWarnings } from "./retirement-plugin.helpers.js";

export const npsManifest = retirementManifest({
  id: "nps",
  title: "NPS",
  description: "Projects employee and employer contributions, then applies explicit annuity allocation and payout assumptions.",
  formula: "future value of current balance and contributions; corpus × annuity allocation × assumed annuity rate",
  governmentScheme: true,
  disclaimers: ["No current statutory allocation, eligibility, tax, or annuity rule is embedded.", "Returns and pension values are estimates, not promises, guarantees, or personalized recommendations."],
});

export function calculateNps(input: NpsInput): NpsResult {
  const parsed = parseCalculatorInput(npsInputSchema, input);
  const currency = ensureSameCurrency(parsed.currentBalance, parsed.contribution, parsed.employerContribution);
  const current = decimal(parsed.currentBalance.amount);
  const employee = decimal(parsed.contribution.amount);
  const employer = decimal(parsed.employerContribution.amount);
  ensureNonNegative(current, "Current balance");
  ensureNonNegative(employee, "Employee contribution");
  ensureNonNegative(employer, "Employer contribution");
  const allocation = boundedPercentage(parsed.annuityAllocation, "Annuity allocation");
  const annuityRate = boundedPercentage(parsed.assumedAnnuityRate, "Assumed annuity rate");
  const estimatedCorpus = futureValueWithContributions({ startingValue: parsed.currentBalance, periodicAmount: asMoney(employee.plus(employer), currency), periodicRate: parsed.expectedReturn, periodCount: parsed.contributionCount, timing: parsed.contributionTiming });
  const corpus = decimal(estimatedCorpus.amount);
  const annuityPurchase = corpus.times(allocation);
  return parseCalculatorResult(npsResultSchema, {
    estimatedCorpus,
    totalEmployeeContributions: asMoney(employee.times(parsed.contributionCount), currency),
    totalEmployerContributions: asMoney(employer.times(parsed.contributionCount), currency),
    estimatedAnnuityPurchase: asMoney(annuityPurchase, currency),
    estimatedLumpSum: asMoney(corpus.minus(annuityPurchase), currency),
    estimatedAnnualPension: asMoney(annuityPurchase.times(annuityRate), currency),
    metadata: resultMetadata(parsed, "nps", true, schemeWarnings(parsed.sourceReferences.length, npsManifest, parsed.ruleVersion, parsed.ruleEffectiveOn)),
  });
}

const exampleInput = { ...calculatorExampleContext, currentBalance: { amount: "100", currency: "INR" }, contribution: { amount: "10", currency: "INR" }, employerContribution: { amount: "5", currency: "INR" }, expectedReturn: { value: "0", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" }, contributionCount: 2, contributionTiming: "end_of_period", annuityAllocation: { value: "40", representation: "human_percentage" }, assumedAnnuityRate: { value: "5", representation: "human_percentage" }, ruleVersion: "caller-1", ruleEffectiveOn: "2026-01-01" } as const;
export const npsPlugin = defineRetirementPlugin({ manifest: npsManifest, inputSchema: npsInputSchema, outputSchema: npsResultSchema, calculate: calculateNps, examples: [{ name: "caller-supplied NPS assumptions", input: exampleInput, expected: calculateNps(exampleInput) }] });
