import { stockAverageInputSchema, stockAverageResultSchema } from "../../generated/finance.schemas.js";
import type { StockAverageInput, StockAverageResult } from "./stock-average.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { asMoney, calculatorExampleContext, decimal, defineInvestmentPlugin, ensurePositive, ensureSameCurrency, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata, serialize } from "./plugin.helpers.js";

export const stockAverageManifest = investmentManifest({ id: "stock-average", title: "Stock Average", description: "Calculates weighted average unit price across purchase lots.", formula: "sum(quantity × unit price) ÷ sum(quantity)", isEstimate: false, ratePolicy: "not_applicable", governmentScheme: false });
export function calculateStockAverage(input: StockAverageInput): StockAverageResult {
  const parsed = parseCalculatorInput(stockAverageInputSchema, input);
  if (parsed.lots.length === 0) throw new FinanceCalculationError("invalid-calculation-input", "At least one purchase lot is required.");
  const currency = ensureSameCurrency(...parsed.lots.map(({ unitPrice }) => unitPrice));
  let quantity = decimal(0);
  let cost = decimal(0);
  for (const lot of parsed.lots) {
    const lotQuantity = decimal(lot.quantity);
    ensurePositive(lotQuantity, "Lot quantity");
    const unitPrice = decimal(lot.unitPrice.amount);
    ensurePositive(unitPrice, "Unit price");
    quantity = quantity.plus(lotQuantity);
    cost = cost.plus(lotQuantity.times(unitPrice));
  }
  return parseCalculatorResult(stockAverageResultSchema, { totalQuantity: serialize(quantity), averageUnitPrice: asMoney(cost.dividedBy(quantity), currency), metadata: resultMetadata(parsed, "stock-average", false) });
}
const exampleInput = { ...calculatorExampleContext, lots: [{ quantity: "2", unitPrice: { amount: "10", currency: "USD" } }, { quantity: "1", unitPrice: { amount: "16", currency: "USD" } }] } as const;
export const stockAveragePlugin = defineInvestmentPlugin({ manifest: stockAverageManifest, inputSchema: stockAverageInputSchema, outputSchema: stockAverageResultSchema, calculate: calculateStockAverage, examples: [{ name: "two purchase lots", input: exampleInput, expected: calculateStockAverage(exampleInput) }] });
