import { futureValueWithContributions } from "../foundation/foundation.calculate.js";
import { ppfInputSchema, ppfResultSchema } from "../../generated/finance.schemas.js";
import type { PpfInput, PpfResult } from "./ppf.contracts.js";
import { asMoney, calculatorExampleContext, decimal, defineInvestmentPlugin, governmentRateWarnings, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const ppfManifest = investmentManifest({ id: "ppf", title: "PPF", description: "Projects user-supplied PPF contributions and rates without a stale statutory preset.", formula: "annuity future value", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: true });
export function calculatePpf(input: PpfInput): PpfResult {
  const parsed = parseCalculatorInput(ppfInputSchema, input);
  const estimatedMaturityValue = futureValueWithContributions({ startingValue: asMoney(decimal(0), parsed.contribution.currency), periodicAmount: parsed.contribution, periodicRate: parsed.assumedRate, periodCount: parsed.periodCount, timing: parsed.contributionTiming });
  return parseCalculatorResult(ppfResultSchema, { estimatedMaturityValue, metadata: resultMetadata(parsed, "ppf", true, governmentRateWarnings(parsed)) });
}
const exampleInput = { ...calculatorExampleContext, contribution: { amount: "100", currency: "INR" }, assumedRate: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, periodCount: 2, contributionTiming: "end_of_period" } as const;
export const ppfPlugin = defineInvestmentPlugin({ manifest: ppfManifest, inputSchema: ppfInputSchema, outputSchema: ppfResultSchema, calculate: calculatePpf, examples: [{ name: "user-supplied zero-rate illustration", input: exampleInput, expected: calculatePpf(exampleInput) }] });
