import { futureValueWithContributions } from "../foundation/foundation.calculate.js";
import { epfInputSchema, epfResultSchema } from "../../generated/finance.schemas.js";
import type { EpfInput, EpfResult } from "./epf.contracts.js";
import { asMoney, calculatorExampleContext, decimal, ensureNonNegative, ensureSameCurrency, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRetirementPlugin, retirementManifest, schemeWarnings } from "./retirement-plugin.helpers.js";

export const epfManifest = retirementManifest({
  id: "epf",
  title: "EPF",
  description: "Projects a balance from separate employee and employer contributions and a caller-supplied return.",
  formula: "future value of current balance plus combined periodic contributions",
  governmentScheme: true,
  disclaimers: ["No current statutory contribution, wage ceiling, eligibility, interest, or tax rule is embedded.", "The projected balance is an estimate and is not a promise, guarantee, or personalized recommendation."],
});

export function calculateEpf(input: EpfInput): EpfResult {
  const parsed = parseCalculatorInput(epfInputSchema, input);
  const currency = ensureSameCurrency(parsed.currentBalance, parsed.periodicContribution, parsed.employerContribution);
  const current = decimal(parsed.currentBalance.amount);
  const employee = decimal(parsed.periodicContribution.amount);
  const employer = decimal(parsed.employerContribution.amount);
  ensureNonNegative(current, "Current balance");
  ensureNonNegative(employee, "Employee contribution");
  ensureNonNegative(employer, "Employer contribution");
  const estimatedBalance = futureValueWithContributions({ startingValue: parsed.currentBalance, periodicAmount: asMoney(employee.plus(employer), currency), periodicRate: parsed.expectedRate, periodCount: parsed.contributionCount, timing: parsed.contributionTiming });
  return parseCalculatorResult(epfResultSchema, {
    estimatedBalance,
    totalEmployeeContributions: asMoney(employee.times(parsed.contributionCount), currency),
    totalEmployerContributions: asMoney(employer.times(parsed.contributionCount), currency),
    metadata: resultMetadata(parsed, "epf", true, schemeWarnings(parsed.sourceReferences.length, epfManifest, parsed.ruleVersion, parsed.ruleEffectiveOn)),
  });
}

const exampleInput = { ...calculatorExampleContext, currentBalance: { amount: "100", currency: "INR" }, periodicContribution: { amount: "10", currency: "INR" }, employerContribution: { amount: "5", currency: "INR" }, expectedRate: { value: "0", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" }, contributionCount: 2, contributionTiming: "end_of_period", ruleVersion: "caller-1", ruleEffectiveOn: "2026-01-01" } as const;
export const epfPlugin = defineRetirementPlugin({ manifest: epfManifest, inputSchema: epfInputSchema, outputSchema: epfResultSchema, calculate: calculateEpf, examples: [{ name: "caller-supplied EPF assumptions", input: exampleInput, expected: calculateEpf(exampleInput) }] });
