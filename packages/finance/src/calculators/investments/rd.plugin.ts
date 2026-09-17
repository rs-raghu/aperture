import { futureValueWithContributions } from "../foundation/foundation.calculate.js";
import { rdInputSchema, rdResultSchema } from "../../generated/finance.schemas.js";
import type { RdInput, RdResult } from "./rd.contracts.js";
import { asMoney, calculatorExampleContext, decimal, defineInvestmentPlugin, governmentRateWarnings, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const rdManifest = investmentManifest({ id: "rd", title: "Recurring Deposit", description: "Projects recurring deposits using an explicit user-supplied rate.", formula: "annuity future value", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: false });
export function calculateRd(input: RdInput): RdResult {
  const parsed = parseCalculatorInput(rdInputSchema, input);
  const estimatedMaturityValue = futureValueWithContributions({ startingValue: asMoney(decimal(0), parsed.periodicContribution.currency), periodicAmount: parsed.periodicContribution, periodicRate: parsed.assumedRate, periodCount: parsed.contributionCount, timing: parsed.contributionTiming });
  return parseCalculatorResult(rdResultSchema, { estimatedMaturityValue, metadata: resultMetadata(parsed, "rd", true, governmentRateWarnings(parsed)) });
}
const exampleInput = { ...calculatorExampleContext, periodicContribution: { amount: "100", currency: "INR" }, assumedRate: { value: "0", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" }, contributionCount: 2, contributionTiming: "end_of_period" } as const;
export const rdPlugin = defineInvestmentPlugin({ manifest: rdManifest, inputSchema: rdInputSchema, outputSchema: rdResultSchema, calculate: calculateRd, examples: [{ name: "two explicit contributions", input: exampleInput, expected: calculateRd(exampleInput) }] });
