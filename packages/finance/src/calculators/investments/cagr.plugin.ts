import { compoundAnnualGrowthRate } from "../foundation/foundation.calculate.js";
import { cagrInputSchema, cagrResultSchema } from "../../generated/finance.schemas.js";
import type { CagrInput, CagrResult } from "./cagr.contracts.js";
import { calculatorExampleContext, defineInvestmentPlugin, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const cagrManifest = investmentManifest({ id: "cagr", title: "CAGR", description: "Calculates annualized compound growth over explicit periods.", formula: "(final ÷ initial)^(1/n) − 1", isEstimate: true, ratePolicy: "not_applicable", governmentScheme: false });
export function calculateCagr(input: CagrInput): CagrResult {
  const parsed = parseCalculatorInput(cagrInputSchema, input);
  return parseCalculatorResult(cagrResultSchema, { annualizedRate: compoundAnnualGrowthRate({ initialValue: parsed.initialValue, finalValue: parsed.finalValue, periodCount: parsed.periodCount }), metadata: resultMetadata(parsed, "cagr", true) });
}
const exampleInput = { ...calculatorExampleContext, initialValue: { amount: "100", currency: "USD" }, finalValue: { amount: "121", currency: "USD" }, periodCount: 2 } as const;
export const cagrPlugin = defineInvestmentPlugin({ manifest: cagrManifest, inputSchema: cagrInputSchema, outputSchema: cagrResultSchema, calculate: calculateCagr, examples: [{ name: "ten percent annualized growth", input: exampleInput, expected: calculateCagr(exampleInput) }] });
