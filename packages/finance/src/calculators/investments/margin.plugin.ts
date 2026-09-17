import { marginInputSchema, marginResultSchema } from "../../generated/finance.schemas.js";
import type { MarginInput, MarginResult } from "./margin.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { asMoney, asPercentage, calculatorExampleContext, decimal, defineInvestmentPlugin, ensureNonNegative, ensurePositive, ensureSameCurrency, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const marginManifest = investmentManifest({ id: "margin", title: "Margin", description: "Separates contributed capital from borrowed position value.", formula: "borrowed = position − capital; margin % = capital ÷ position", isEstimate: false, ratePolicy: "not_applicable", governmentScheme: false });
export function calculateMargin(input: MarginInput): MarginResult {
  const parsed = parseCalculatorInput(marginInputSchema, input);
  const currency = ensureSameCurrency(parsed.positionValue, parsed.contributedCapital);
  const position = decimal(parsed.positionValue.amount);
  const capital = decimal(parsed.contributedCapital.amount);
  ensurePositive(position, "Position value");
  ensureNonNegative(capital, "Contributed capital");
  if (capital.gt(position)) throw new FinanceCalculationError("invalid-calculation-input", "Contributed capital must not exceed position value.");
  return parseCalculatorResult(marginResultSchema, { borrowedAmount: asMoney(position.minus(capital), currency), marginPercentage: asPercentage(capital.dividedBy(position).times(100)), metadata: resultMetadata(parsed, "margin", false) });
}
const exampleInput = { ...calculatorExampleContext, positionValue: { amount: "1000", currency: "USD" }, contributedCapital: { amount: "400", currency: "USD" } } as const;
export const marginPlugin = defineInvestmentPlugin({ manifest: marginManifest, inputSchema: marginInputSchema, outputSchema: marginResultSchema, calculate: calculateMargin, examples: [{ name: "forty percent margin", input: exampleInput, expected: calculateMargin(exampleInput) }] });
