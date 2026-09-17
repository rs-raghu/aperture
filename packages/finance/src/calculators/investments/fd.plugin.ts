import { compoundInterest } from "../foundation/foundation.calculate.js";
import { fdInputSchema, fdResultSchema } from "../../generated/finance.schemas.js";
import type { FdInput, FdResult } from "./fd.contracts.js";
import { calculatorExampleContext, defineInvestmentPlugin, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const fdManifest = investmentManifest({ id: "fd", title: "Fixed Deposit", description: "Projects a fixed deposit using an explicit rate and compounding frequency.", formula: "compound interest", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: false });
export function calculateFd(input: FdInput): FdResult {
  const parsed = parseCalculatorInput(fdInputSchema, input);
  return parseCalculatorResult(fdResultSchema, { estimatedMaturityValue: compoundInterest({ principal: parsed.principal, rate: parsed.assumedRate, periodCount: parsed.periodCount }).total, metadata: resultMetadata(parsed, "fd", true) });
}
const exampleInput = { ...calculatorExampleContext, principal: { amount: "100", currency: "USD" }, assumedRate: { value: "10", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, periodCount: 1 } as const;
export const fdPlugin = defineInvestmentPlugin({ manifest: fdManifest, inputSchema: fdInputSchema, outputSchema: fdResultSchema, calculate: calculateFd, examples: [{ name: "one annual period", input: exampleInput, expected: calculateFd(exampleInput) }] });
