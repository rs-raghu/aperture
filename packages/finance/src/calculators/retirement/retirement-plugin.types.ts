import type { ValidationSchema } from "@aperture/validation";

export type RetirementCalculatorId = "fire" | "retirement-corpus" | "nps" | "gratuity" | "epf" | "apy";

export interface RetirementCalculatorManifest {
  readonly id: RetirementCalculatorId;
  readonly title: string;
  readonly category: "retirement";
  readonly version: "1.0.0";
  readonly description: string;
  readonly formula: string;
  readonly isEstimate: true;
  readonly governmentScheme: boolean;
  readonly ratePolicy: "required_user_input";
  readonly disclaimers: readonly string[];
  readonly presets: readonly never[];
}

export interface RetirementCalculatorPlugin<TInput = unknown, TOutput = unknown> {
  readonly manifest: RetirementCalculatorManifest;
  readonly inputSchema: ValidationSchema<unknown>;
  readonly outputSchema: ValidationSchema<unknown>;
  readonly calculate: (input: TInput) => TOutput;
  readonly examples: readonly { readonly name: string; readonly input: TInput; readonly expected: TOutput }[];
}
