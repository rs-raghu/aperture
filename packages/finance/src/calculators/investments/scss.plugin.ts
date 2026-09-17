import { scssInputSchema, scssResultSchema } from "../../generated/finance.schemas.js";
import type { ScssInput, ScssResult } from "./scss.contracts.js";
import { asMoney, calculatorExampleContext, decimal, defineInvestmentPlugin, ensurePositive, governmentRateWarnings, investmentManifest, parseCalculatorInput, parseCalculatorResult, rateFraction, resultMetadata } from "./plugin.helpers.js";

export const scssManifest = investmentManifest({ id: "scss", title: "Senior Citizens Savings Scheme", description: "Estimates periodic income from user-supplied SCSS assumptions.", formula: "principal × rate ÷ payment count", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: true });
export function calculateScss(input: ScssInput): ScssResult {
  const parsed = parseCalculatorInput(scssInputSchema, input);
  const principal = decimal(parsed.principal.amount);
  ensurePositive(principal, "Principal");
  const income = principal.times(rateFraction(parsed.assumedRate)).dividedBy(parsed.paymentCount);
  return parseCalculatorResult(scssResultSchema, { estimatedPeriodicIncome: asMoney(income, parsed.principal.currency), metadata: resultMetadata(parsed, "scss", true, governmentRateWarnings(parsed)) });
}
const exampleInput = { ...calculatorExampleContext, principal: { amount: "1200", currency: "INR" }, assumedRate: { value: "12", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, paymentCount: 12 } as const;
export const scssPlugin = defineInvestmentPlugin({ manifest: scssManifest, inputSchema: scssInputSchema, outputSchema: scssResultSchema, calculate: calculateScss, examples: [{ name: "twelve income payments", input: exampleInput, expected: calculateScss(exampleInput) }] });
