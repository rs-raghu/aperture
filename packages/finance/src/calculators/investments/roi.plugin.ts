import { returnOnInvestment } from "../foundation/foundation.calculate.js";
import { roiInputSchema, roiResultSchema } from "../../generated/finance.schemas.js";
import type { RoiInput, RoiResult } from "./roi.contracts.js";
import { calculatorExampleContext, defineInvestmentPlugin, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const roiManifest = investmentManifest({ id: "roi", title: "ROI", description: "Calculates absolute and percentage return from two values.", formula: "(final − initial) ÷ initial", isEstimate: false, ratePolicy: "not_applicable", governmentScheme: false });
export function calculateRoi(input: RoiInput): RoiResult {
  const parsed = parseCalculatorInput(roiInputSchema, input);
  const result = returnOnInvestment({ initialValue: parsed.initialValue, finalValue: parsed.finalValue });
  return parseCalculatorResult(roiResultSchema, { ...result, metadata: resultMetadata(parsed, "roi", false) });
}
const exampleInput = { ...calculatorExampleContext, initialValue: { amount: "100", currency: "USD" }, finalValue: { amount: "125", currency: "USD" } } as const;
export const roiPlugin = defineInvestmentPlugin({ manifest: roiManifest, inputSchema: roiInputSchema, outputSchema: roiResultSchema, calculate: calculateRoi, examples: [{ name: "twenty-five percent return", input: exampleInput, expected: calculateRoi(exampleInput) }] });
