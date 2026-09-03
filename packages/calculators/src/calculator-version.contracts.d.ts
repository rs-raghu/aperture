import type { CalculatorId, CalculatorVersion } from "./calculator.types.js";

export interface CalculatorVersionDescriptor {
  readonly calculatorId: CalculatorId;
  readonly version: CalculatorVersion;
  readonly inputContract: string;
  readonly resultContract: string;
  readonly releasedAt?: string;
}

export interface CalculatorVersionContract {
  getVersion(
    calculatorId: CalculatorId,
    version: CalculatorVersion
  ): Promise<CalculatorVersionDescriptor | null>;
  listVersions(calculatorId: CalculatorId): Promise<readonly CalculatorVersionDescriptor[]>;
}
