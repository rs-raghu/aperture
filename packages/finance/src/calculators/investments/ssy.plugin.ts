import { futureValueWithContributions } from "../foundation/foundation.calculate.js";
import { ssyInputSchema, ssyResultSchema } from "../../generated/finance.schemas.js";
import type { SsyInput, SsyResult } from "./ssy.contracts.js";
import { asMoney, calculatorExampleContext, decimal, defineInvestmentPlugin, governmentRateWarnings, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const ssyManifest = investmentManifest({ id: "ssy", title: "Sukanya Samriddhi Yojana", description: "Projects user-supplied SSY contributions and rates without a stale statutory preset.", formula: "annuity future value", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: true });
export function calculateSsy(input: SsyInput): SsyResult {
  const parsed = parseCalculatorInput(ssyInputSchema, input);
  const estimatedMaturityValue = futureValueWithContributions({ startingValue: asMoney(decimal(0), parsed.contribution.currency), periodicAmount: parsed.contribution, periodicRate: parsed.assumedRate, periodCount: parsed.periodCount, timing: parsed.contributionTiming });
  return parseCalculatorResult(ssyResultSchema, { estimatedMaturityValue, metadata: resultMetadata(parsed, "ssy", true, governmentRateWarnings(parsed)) });
}
const exampleInput = { ...calculatorExampleContext, contribution: { amount: "100", currency: "INR" }, assumedRate: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, periodCount: 2, contributionTiming: "end_of_period" } as const;
export const ssyPlugin = defineInvestmentPlugin({ manifest: ssyManifest, inputSchema: ssyInputSchema, outputSchema: ssyResultSchema, calculate: calculateSsy, examples: [{ name: "user-supplied zero-rate illustration", input: exampleInput, expected: calculateSsy(exampleInput) }] });
