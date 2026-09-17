import { flatVsReducingRateInputSchema, flatVsReducingRateResultSchema } from "../../generated/finance.schemas.js";
import type { FlatVsReducingRateInput, FlatVsReducingRateResult } from "./flat-vs-reducing-rate.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { asMoney, calculatorExampleContext, decimal, ensurePositive, parseCalculatorInput, parseCalculatorResult, rateFraction, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";
import { loanSchedule } from "./loan-plugin.helpers.js";

export const flatVsReducingRateManifest = regulatedManifest({ id: "flat-vs-reducing-rate", title: "Flat versus Reducing Rate", category: "loan", description: "Compares annual flat simple interest with monthly reducing-balance payments.", formula: "flat simple-interest total versus reducing-balance amortization total", isEstimate: true, disclaimers: ["Payment count is interpreted as monthly and divided by 12 for the flat-rate term.", "The comparison excludes lender fees and product-specific rounding."] });
export function compareFlatAndReducingRate(input: FlatVsReducingRateInput): FlatVsReducingRateResult {
  const parsed = parseCalculatorInput(flatVsReducingRateInputSchema, input);
  if (parsed.flatRate.period !== "year" || parsed.reducingRate.period !== "year") throw new FinanceCalculationError("unsupported-rate-convention", "Both comparison rates must identify an annual period.");
  const principal = decimal(parsed.principal.amount);
  ensurePositive(principal, "Principal");
  const flatTotal = principal.plus(principal.times(rateFraction(parsed.flatRate)).times(decimal(parsed.paymentCount).dividedBy(12)));
  const reducing = loanSchedule(parsed.principal, parsed.reducingRate, parsed.reducingRateKind, parsed.paymentCount).totalPayment;
  const reducingTotal = decimal(reducing.amount);
  return parseCalculatorResult(flatVsReducingRateResultSchema, { estimatedFlatTotal: asMoney(flatTotal, parsed.principal.currency), estimatedReducingTotal: reducing, estimatedDifference: asMoney(flatTotal.minus(reducingTotal), parsed.principal.currency), metadata: resultMetadata(parsed, "flat-vs-reducing-rate", true, disclosureWarnings(...flatVsReducingRateManifest.disclaimers, `Flat rate convention: ${parsed.flatRateKind}.`, `Reducing rate convention: ${parsed.reducingRateKind}.`)) });
}
const exampleInput = { ...calculatorExampleContext, principal: { amount: "1200", currency: "USD" }, flatRate: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, flatRateKind: "nominal", reducingRate: { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" }, reducingRateKind: "nominal", paymentCount: 12 } as const;
export const flatVsReducingRatePlugin = defineRegulatedPlugin({ manifest: flatVsReducingRateManifest, inputSchema: flatVsReducingRateInputSchema, outputSchema: flatVsReducingRateResultSchema, calculate: compareFlatAndReducingRate, examples: [{ name: "zero-rate comparison", input: exampleInput, expected: compareFlatAndReducingRate(exampleInput) }] });
