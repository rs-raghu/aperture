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

/** Quantities are decimal strings, unit prices retain currency, and result metadata is explicit. */
export declare function calculateStockAverage(input: StockAverageInput): StockAverageResult;
