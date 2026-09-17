import type { ValidationSchema } from "@aperture/validation";
import type { CalculatorAssumption, CalculatorSourceReference } from "../calculator.types.js";

export type InvestmentCalculatorId =
  | "sip"
  | "step-up-sip"
  | "lumpsum"
  | "swp"
  | "mutual-fund-returns"
  | "ssy"
  | "ppf"
  | "fd"
  | "rd"
  | "nsc"
  | "post-office-mis"
  | "scss"
  | "stock-average"
  | "brokerage"
  | "margin"
  | "roi"
  | "cagr"
  | "xirr";

export interface InvestmentCalculatorManifest {
  readonly id: InvestmentCalculatorId;
  readonly title: string;
  readonly category: "investment";
  readonly version: "1.0.0";
  readonly routeSegment: string;
  readonly description: string;
  readonly formula: string;
  readonly isEstimate: boolean;
  readonly ratePolicy: "not_applicable" | "required_user_input";
  readonly governmentScheme: boolean;
  readonly presets: readonly InvestmentCalculatorPreset[];
}

export interface InvestmentCalculatorPreset {
  readonly assumptionVersion: string;
  readonly effectiveOn: string;
  readonly retrievedOn: string;
  readonly sourceUrl: string;
  readonly assumptions: readonly CalculatorAssumption[];
  readonly sourceReferences: readonly CalculatorSourceReference[];
}

export interface InvestmentCalculatorExample<TInput, TOutput> {
  readonly name: string;
  readonly input: TInput;
  readonly expected: TOutput;
}

export interface InvestmentCalculatorPlugin<TInput = unknown, TOutput = unknown> {
  readonly manifest: InvestmentCalculatorManifest;
  readonly inputSchema: ValidationSchema<unknown>;
  readonly outputSchema: ValidationSchema<unknown>;
  readonly calculate: (input: TInput) => TOutput;
  readonly examples: readonly InvestmentCalculatorExample<TInput, TOutput>[];
}
