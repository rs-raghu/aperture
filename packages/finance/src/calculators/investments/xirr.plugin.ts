import { createCashFlowTimeline, xirr } from "../foundation/foundation.calculate.js";
import { xirrInputSchema, xirrResultSchema } from "../../generated/finance.schemas.js";
import type { XirrInput, XirrResult } from "./xirr.contracts.js";
import { calculatorExampleContext, defineInvestmentPlugin, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const xirrManifest = investmentManifest({ id: "xirr", title: "XIRR", description: "Calculates a bounded annual return for irregular dated cash flows.", formula: "Actual/365 Fixed NPV root", isEstimate: true, ratePolicy: "not_applicable", governmentScheme: false });
export function calculateXirr(input: XirrInput): XirrResult {
  const parsed = parseCalculatorInput(xirrInputSchema, input);
  const timeline = createCashFlowTimeline({ cashFlows: parsed.cashFlows, dayCountConvention: "actual_365_fixed" });
  return parseCalculatorResult(xirrResultSchema, { annualizedRate: xirr({ timeline }), metadata: resultMetadata(parsed, "xirr", true) });
}
const exampleInput = { ...calculatorExampleContext, cashFlows: [{ date: "2026-01-01", amount: { amount: "-1000", currency: "USD" } }, { date: "2027-01-01", amount: { amount: "1100", currency: "USD" } }] } as const;
export const xirrPlugin = defineInvestmentPlugin({ manifest: xirrManifest, inputSchema: xirrInputSchema, outputSchema: xirrResultSchema, calculate: calculateXirr, examples: [{ name: "one-year irregular return", input: exampleInput, expected: calculateXirr(exampleInput) }] });
