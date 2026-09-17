import { brokerageInputSchema, brokerageResultSchema } from "../../generated/finance.schemas.js";
import type { BrokerageInput, BrokerageResult } from "./brokerage.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { asMoney, calculatorExampleContext, decimal, defineInvestmentPlugin, ensureNonNegative, ensurePositive, ensureSameCurrency, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const brokerageManifest = investmentManifest({ id: "brokerage", title: "Brokerage", description: "Estimates brokerage plus explicit additional charges.", formula: "trade value × brokerage rate + charges", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: false });
export function calculateBrokerage(input: BrokerageInput): BrokerageResult {
  const parsed = parseCalculatorInput(brokerageInputSchema, input);
  const currency = ensureSameCurrency(parsed.tradeValue, parsed.additionalCharges);
  const trade = decimal(parsed.tradeValue.amount);
  const additional = decimal(parsed.additionalCharges.amount);
  const rate = decimal(parsed.brokerageRate.value).dividedBy(100);
  ensurePositive(trade, "Trade value");
  ensureNonNegative(additional, "Additional charges");
  ensureNonNegative(rate, "Brokerage rate");
  const charges = trade.times(rate).plus(additional);
  if (charges.gt(trade)) throw new FinanceCalculationError("invalid-calculation-input", "Charges must not exceed trade value.");
  return parseCalculatorResult(brokerageResultSchema, { estimatedCharges: asMoney(charges, currency), estimatedNetAmount: asMoney(trade.minus(charges), currency), metadata: resultMetadata(parsed, "brokerage", true) });
}
const exampleInput = { ...calculatorExampleContext, tradeValue: { amount: "1000", currency: "USD" }, brokerageRate: { value: "1", representation: "human_percentage" }, additionalCharges: { amount: "5", currency: "USD" } } as const;
export const brokeragePlugin = defineInvestmentPlugin({ manifest: brokerageManifest, inputSchema: brokerageInputSchema, outputSchema: brokerageResultSchema, calculate: calculateBrokerage, examples: [{ name: "rate plus charges", input: exampleInput, expected: calculateBrokerage(exampleInput) }] });
