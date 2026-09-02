import type { FinancialMetadata, IsoDate, OwnerId, OwnerQuery } from "../finance.types.js";

export type CalculatorId = string;
export type CalculatorScenarioId = string;
export type CalculatorVersion = string;
export type CalculatorCategory = "retirement" | "investment" | "loan" | "income_tax" | "economic";

export interface CalculatorAssumption {
  readonly key: string;
  readonly description: string;
  readonly effectiveOn?: IsoDate;
}

export interface CalculatorSourceReference {
  readonly title: string;
  readonly reference: string;
  readonly effectiveOn?: IsoDate;
}

export interface CalculatorWarning {
  readonly code: string;
  readonly message: string;
}

export interface CalculatorInputContext {
  readonly version: CalculatorVersion;
  readonly assumptions: readonly CalculatorAssumption[];
  readonly sourceReferences: readonly CalculatorSourceReference[];
}

export interface CalculatorResultMetadata {
  readonly calculatorId: CalculatorId;
  readonly version: CalculatorVersion;
  readonly isEstimate: boolean;
  readonly assumptions: readonly CalculatorAssumption[];
  readonly sourceReferences: readonly CalculatorSourceReference[];
  readonly warnings: readonly CalculatorWarning[];
}

export interface SavedCalculatorScenario extends FinancialMetadata {
  readonly id: CalculatorScenarioId;
  readonly calculatorId: CalculatorId;
  readonly calculatorVersion: CalculatorVersion;
  readonly name: string;
  readonly input: Readonly<Record<string, unknown>>;
}

export interface CreateSavedCalculatorScenarioInput {
  readonly ownerId: OwnerId;
  readonly calculatorId: CalculatorId;
  readonly calculatorVersion: CalculatorVersion;
  readonly name: string;
  readonly input: Readonly<Record<string, unknown>>;
}

export interface UpdateSavedCalculatorScenarioInput {
  readonly name?: string;
  readonly input?: Readonly<Record<string, unknown>>;
}

export interface SavedCalculatorScenarioListQuery extends OwnerQuery {
  readonly calculatorId?: CalculatorId;
}
