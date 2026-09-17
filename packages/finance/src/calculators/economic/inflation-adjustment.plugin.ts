import { inflationAdjustedValue } from "../foundation/foundation.calculate.js";
import { inflationAdjustedValueInputSchema, inflationAdjustedValueResultSchema } from "../../generated/finance.schemas.js";
import type { InflationAdjustedValueInput, InflationAdjustedValueResult } from "./inflation-adjustment.contracts.js";
import { calculatorExampleContext, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";

export const inflationAdjustedValueManifest = regulatedManifest({ id: "inflation-adjusted-value", title: "Inflation-adjusted Prices", category: "economic", description: "Projects a present value using an explicit inflation assumption.", formula: "present value × (1 + inflation)^periods", isEstimate: true, disclaimers: ["The supplied inflation rate is an assumption and is not a forecast or financial advice."] });
export function calculateInflationAdjustedValue(input: InflationAdjustedValueInput): InflationAdjustedValueResult {
  const parsed = parseCalculatorInput(inflationAdjustedValueInputSchema, input);
  return parseCalculatorResult(inflationAdjustedValueResultSchema, { estimatedAdjustedValue: inflationAdjustedValue({ value: parsed.presentValue, inflationRate: parsed.inflationRate, periodCount: parsed.periodCount, direction: "inflate" }), metadata: resultMetadata(parsed, "inflation-adjusted-value", true, disclosureWarnings(...inflationAdjustedValueManifest.disclaimers)) });
}
const exampleInput = { ...calculatorExampleContext, presentValue: { amount: "100", currency: "USD" }, inflationRate: { value: "10", representation: "human_percentage" }, periodCount: 2 } as const;
export const inflationAdjustedValuePlugin = defineRegulatedPlugin({ manifest: inflationAdjustedValueManifest, inputSchema: inflationAdjustedValueInputSchema, outputSchema: inflationAdjustedValueResultSchema, calculate: calculateInflationAdjustedValue, examples: [{ name: "two inflation periods", input: exampleInput, expected: calculateInflationAdjustedValue(exampleInput) }] });
