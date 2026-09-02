import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface StockPurchaseLot { readonly quantity: DecimalString; readonly unitPrice: Money; }

export interface StockAverageInput extends CalculatorInputContext {
  readonly lots: readonly StockPurchaseLot[];
}

export interface StockAverageResult {
  readonly totalQuantity: DecimalString;
  readonly averageUnitPrice: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Quantities are decimal strings and unit prices retain currency. Output is not an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateStockAverage(input: StockAverageInput): StockAverageResult;
