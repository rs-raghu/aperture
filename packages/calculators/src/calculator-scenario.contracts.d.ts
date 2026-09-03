import type { CalculatorId } from "./calculator.types.js";

export type CalculatorScenarioId = string;

export interface CalculatorScenario {
  readonly id: CalculatorScenarioId;
  readonly ownerId: string;
  readonly calculatorId: CalculatorId;
  readonly name: string;
  readonly input: unknown;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveCalculatorScenarioInput {
  readonly id?: CalculatorScenarioId;
  readonly ownerId: string;
  readonly calculatorId: CalculatorId;
  readonly name: string;
  readonly input: unknown;
}

export interface CalculatorScenarioComparison {
  readonly scenarioIds: readonly CalculatorScenarioId[];
  readonly comparable: boolean;
  readonly differences: readonly string[];
}

export declare function saveCalculatorScenario(
  input: SaveCalculatorScenarioInput
): Promise<CalculatorScenario>;
export declare function getCalculatorScenario(
  id: CalculatorScenarioId
): Promise<CalculatorScenario | null>;
export declare function listCalculatorScenarios(
  ownerId: string,
  calculatorId?: CalculatorId
): Promise<readonly CalculatorScenario[]>;
export declare function deleteCalculatorScenario(id: CalculatorScenarioId): Promise<void>;
export declare function compareCalculatorScenarios(
  scenarioIds: readonly CalculatorScenarioId[]
): Promise<CalculatorScenarioComparison>;
