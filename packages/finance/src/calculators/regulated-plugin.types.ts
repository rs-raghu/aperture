import type { ValidationSchema } from "@aperture/validation";

export type RegulatedCalculatorId =
  | "emi"
  | "home-loan-emi"
  | "car-loan-emi"
  | "simple-interest"
  | "compound-interest"
  | "flat-vs-reducing-rate"
  | "net-salary"
  | "income-tax"
  | "tds"
  | "hra"
  | "gst"
  | "inflation-adjusted-value";

export interface RegulatedCalculatorManifest {
  readonly id: RegulatedCalculatorId;
  readonly title: string;
  readonly category: "loan" | "income_tax" | "economic";
  readonly version: "1.0.0";
  readonly description: string;
  readonly formula: string;
  readonly isEstimate: boolean;
  readonly disclaimers: readonly string[];
  readonly presets: readonly never[];
}

export interface RegulatedCalculatorPlugin<TInput = unknown, TOutput = unknown> {
  readonly manifest: RegulatedCalculatorManifest;
  readonly inputSchema: ValidationSchema<unknown>;
  readonly outputSchema: ValidationSchema<unknown>;
  readonly calculate: (input: TInput) => TOutput;
  readonly examples: readonly { readonly name: string; readonly input: TInput; readonly expected: TOutput }[];
}
