import { compoundInterest } from "../foundation/foundation.calculate.js";
import { nscInputSchema, nscResultSchema } from "../../generated/finance.schemas.js";
import type { NscInput, NscResult } from "./nsc.contracts.js";
import { calculatorExampleContext, defineInvestmentPlugin, governmentRateWarnings, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const nscManifest = investmentManifest({ id: "nsc", title: "National Savings Certificate", description: "Projects a user-supplied NSC rate without a stale statutory preset.", formula: "compound interest", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: true });
export function calculateNsc(input: NscInput): NscResult {
  const parsed = parseCalculatorInput(nscInputSchema, input);
  return parseCalculatorResult(nscResultSchema, { estimatedMaturityValue: compoundInterest({ principal: parsed.principal, rate: parsed.assumedRate, periodCount: parsed.periodCount }).total, metadata: resultMetadata(parsed, "nsc", true, governmentRateWarnings(parsed)) });
}
const exampleInput = { ...calculatorExampleContext, principal: { amount: "100", currency: "INR" }, assumedRate: { value: "10", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, periodCount: 1 } as const;
export const nscPlugin = defineInvestmentPlugin({ manifest: nscManifest, inputSchema: nscInputSchema, outputSchema: nscResultSchema, calculate: calculateNsc, examples: [{ name: "user-supplied annual rate", input: exampleInput, expected: calculateNsc(exampleInput) }] });
