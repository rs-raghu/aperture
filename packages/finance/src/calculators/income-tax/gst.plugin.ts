import { gstInputSchema, gstResultSchema } from "../../generated/finance.schemas.js";
import type { GstInput, GstResult } from "./gst.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { asMoney, calculatorExampleContext, decimal, ensureNonNegative, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";

export const gstManifest = regulatedManifest({ id: "gst", title: "GST", category: "income_tax", description: "Separates inclusive or exclusive tax using an explicit rate.", formula: "exclusive: amount × rate; inclusive: gross − gross/(1+rate)", isEstimate: true, disclaimers: ["The supplied rate is not asserted to be the current rate for any good, service, or jurisdiction."] });
export function calculateGst(input: GstInput): GstResult {
  const parsed = parseCalculatorInput(gstInputSchema, input);
  const amount = decimal(parsed.amount.amount);
  const rate = decimal(parsed.taxRate.value).dividedBy(100);
  ensureNonNegative(amount, "Amount");
  ensureNonNegative(rate, "Tax rate");
  if (rate.gt(1)) throw new FinanceCalculationError("invalid-calculation-input", "Tax rate must not exceed 100 percent.");
  const net = parsed.pricingMode === "inclusive" ? amount.dividedBy(decimal(1).plus(rate)) : amount;
  const gross = parsed.pricingMode === "inclusive" ? amount : amount.times(decimal(1).plus(rate));
  return parseCalculatorResult(gstResultSchema, { estimatedTax: asMoney(gross.minus(net), parsed.amount.currency), estimatedNetAmount: asMoney(net, parsed.amount.currency), estimatedGrossAmount: asMoney(gross, parsed.amount.currency), metadata: resultMetadata(parsed, "gst", true, disclosureWarnings(...gstManifest.disclaimers)) });
}
const exampleInput = { ...calculatorExampleContext, amount: { amount: "100", currency: "INR" }, taxRate: { value: "18", representation: "human_percentage" }, pricingMode: "exclusive" } as const;
export const gstPlugin = defineRegulatedPlugin({ manifest: gstManifest, inputSchema: gstInputSchema, outputSchema: gstResultSchema, calculate: calculateGst, examples: [{ name: "exclusive tax", input: exampleInput, expected: calculateGst(exampleInput) }] });
