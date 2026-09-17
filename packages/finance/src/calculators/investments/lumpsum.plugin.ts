import { futureValue } from "../foundation/foundation.calculate.js";
import { lumpsumInputSchema, lumpsumResultSchema } from "../../generated/finance.schemas.js";
import type { LumpsumInput, LumpsumResult } from "./lumpsum.contracts.js";
import { calculatorExampleContext, defineInvestmentPlugin, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const lumpsumManifest = investmentManifest({ id: "lumpsum", title: "Lumpsum", description: "Projects one investment over explicit periods.", formula: "future value", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: false });
export function calculateLumpsum(input: LumpsumInput): LumpsumResult {
  const parsed = parseCalculatorInput(lumpsumInputSchema, input);
  return parseCalculatorResult(lumpsumResultSchema, { estimatedValue: futureValue({ value: parsed.principal, periodicRate: parsed.expectedReturn, periodCount: parsed.periodCount }), metadata: resultMetadata(parsed, "lumpsum", true) });
}
const exampleInput = { ...calculatorExampleContext, principal: { amount: "100", currency: "USD" }, expectedReturn: { value: "10", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, periodCount: 2 } as const;
export const lumpsumPlugin = defineInvestmentPlugin({ manifest: lumpsumManifest, inputSchema: lumpsumInputSchema, outputSchema: lumpsumResultSchema, calculate: calculateLumpsum, examples: [{ name: "two annual periods", input: exampleInput, expected: calculateLumpsum(exampleInput) }] });
