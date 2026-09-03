export type CalculatorId = string;
export type CalculatorCategory = "education" | "finance";
export type CalculatorVersion = string;

export interface CalculatorDescriptor {
  readonly id: CalculatorId;
  readonly category: CalculatorCategory;
  readonly name: string;
  readonly description: string;
  readonly version: CalculatorVersion;
  readonly inputContract: string;
  readonly resultContract: string;
}

export interface CalculatorSearchQuery {
  readonly text: string;
  readonly category?: CalculatorCategory;
}
