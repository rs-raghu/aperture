import { tdsInputSchema, tdsResultSchema } from "../../generated/finance.schemas.js";
import type { TdsInput, TdsResult } from "./tds.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { asMoney, calculatorExampleContext, decimal, ensureNonNegative, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";

export const tdsManifest = regulatedManifest({ id: "tds", title: "TDS Withholding", category: "income_tax", description: "Estimates withholding from an explicitly supplied rate.", formula: "payment × withholding rate", isEstimate: true, disclaimers: ["TDS is withholding and is not a calculation of final tax liability.", "Thresholds, certificates, credits, and filing outcomes are outside this calculation."] });
export function calculateTds(input: TdsInput): TdsResult {
  const parsed = parseCalculatorInput(tdsInputSchema, input);
  const payment = decimal(parsed.paymentAmount.amount);
  const rate = decimal(parsed.withholdingRate.value).dividedBy(100);
  ensureNonNegative(payment, "Payment amount");
  ensureNonNegative(rate, "Withholding rate");
  if (rate.gt(1)) throw new FinanceCalculationError("invalid-calculation-input", "Withholding rate must not exceed 100 percent.");
  const withholding = payment.times(rate);
  return parseCalculatorResult(tdsResultSchema, { estimatedWithholding: asMoney(withholding, parsed.paymentAmount.currency), estimatedNetPayment: asMoney(payment.minus(withholding), parsed.paymentAmount.currency), metadata: resultMetadata(parsed, "tds", true, disclosureWarnings(...tdsManifest.disclaimers)) });
}
const exampleInput = { ...calculatorExampleContext, paymentAmount: { amount: "1000", currency: "INR" }, withholdingRate: { value: "10", representation: "human_percentage" } } as const;
export const tdsPlugin = defineRegulatedPlugin({ manifest: tdsManifest, inputSchema: tdsInputSchema, outputSchema: tdsResultSchema, calculate: calculateTds, examples: [{ name: "explicit withholding", input: exampleInput, expected: calculateTds(exampleInput) }] });
