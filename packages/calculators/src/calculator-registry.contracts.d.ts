import type {
  CalculatorCategory,
  CalculatorDescriptor,
  CalculatorId,
  CalculatorSearchQuery
} from "./calculator.types.js";

export declare function getCalculator(id: CalculatorId): Promise<CalculatorDescriptor | null>;
export declare function listCalculators(): Promise<readonly CalculatorDescriptor[]>;
export declare function listCalculatorsByCategory(
  category: CalculatorCategory
): Promise<readonly CalculatorDescriptor[]>;
export declare function searchCalculators(
  query: CalculatorSearchQuery
): Promise<readonly CalculatorDescriptor[]>;
