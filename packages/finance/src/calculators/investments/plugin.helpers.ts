import { Decimal } from "decimal.js";
import { validateInput } from "@aperture/validation";

import type { ValidationSchema } from "@aperture/validation";
import type { CalculatorResultMetadata, CalculatorWarning } from "../calculator.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import type { InvestmentCalculatorManifest, InvestmentCalculatorPlugin } from "./plugin.types.js";

const InvestmentDecimal = Decimal.clone({ precision: 50, rounding: Decimal.ROUND_HALF_EVEN, toExpNeg: -1_000_000, toExpPos: 1_000_000 });

export const calculatorExampleContext = {
  version: "1.0.0",
  assumptions: [],
  sourceReferences: [],
} as const;

export function parseCalculatorInput<T>(schema: ValidationSchema<T>, input: unknown): T {
  const result = validateInput(schema, input);
  if (result.success) return result.value;
  throw new FinanceCalculationError("invalid-calculation-input", result.issues.map(({ message }) => message).join("; "), result.issues);
}

export function parseCalculatorResult<T>(schema: ValidationSchema<unknown>, result: T): T {
  const validation = validateInput(schema, result);
  if (validation.success) return result;
  throw new FinanceCalculationError("invalid-calculation-result", "The calculator produced an invalid result.", validation.issues);
}

export function decimal(value: string | number): Decimal {
  try {
    return new InvestmentDecimal(value);
  } catch {
    throw new FinanceCalculationError("calculation-failed", "A validated decimal value could not be processed.");
  }
}

export function serialize(value: Decimal): string {
  if (!value.isFinite()) throw new FinanceCalculationError("calculation-failed", "The calculator did not produce a finite result.");
  return value.isZero() ? "0" : value.toFixed();
}

export function asMoney(value: Decimal, currency: string): Money {
  return { amount: serialize(value), currency };
}

export function asPercentage(value: Decimal) {
  return { value: serialize(value), representation: "human_percentage" as const };
}

export function rateFraction(rate: InterestRate): Decimal {
  const result = decimal(rate.value).dividedBy(100);
  if (result.lte(-1)) throw new FinanceCalculationError("invalid-calculation-input", "Rate must be greater than -100 percent.");
  return result;
}

export function ensurePositive(value: Decimal, label: string): void {
  if (!value.gt(0)) throw new FinanceCalculationError("invalid-calculation-input", `${label} must be greater than zero.`);
}

export function ensureNonNegative(value: Decimal, label: string): void {
  if (value.isNegative()) throw new FinanceCalculationError("invalid-calculation-input", `${label} must not be negative.`);
}

export function ensureSameCurrency(...values: readonly Money[]): string {
  const currency = values[0]?.currency;
  if (!currency || values.some((value) => value.currency !== currency)) {
    throw new FinanceCalculationError("currency-mismatch", "All monetary inputs must use the same currency.");
  }
  return currency;
}

export function resultMetadata(
  input: RuntimeCalculatorContext,
  calculatorId: string,
  isEstimate: boolean,
  warnings: readonly CalculatorWarning[] = [],
): CalculatorResultMetadata {
  return {
    calculatorId,
    version: input.version,
    isEstimate,
    assumptions: input.assumptions.map((assumption) => assumption.effectiveOn === undefined
      ? { key: assumption.key, description: assumption.description }
      : { key: assumption.key, description: assumption.description, effectiveOn: assumption.effectiveOn }),
    sourceReferences: input.sourceReferences.map((source) => source.effectiveOn === undefined
      ? { title: source.title, reference: source.reference }
      : { title: source.title, reference: source.reference, effectiveOn: source.effectiveOn }),
    warnings,
  };
}

export function governmentRateWarnings(input: RuntimeCalculatorContext): readonly CalculatorWarning[] {
  return input.sourceReferences.length > 0 ? [] : [{
    code: "user_supplied_rate_unverified",
    message: "The calculation uses a required user-supplied rate and does not claim that it is the current official rate.",
  }];
}

interface RuntimeCalculatorContext {
  readonly version: string;
  readonly assumptions: readonly {
    readonly key: string;
    readonly description: string;
    readonly effectiveOn?: string | undefined;
  }[];
  readonly sourceReferences: readonly {
    readonly title: string;
    readonly reference: string;
    readonly effectiveOn?: string | undefined;
  }[];
}

export function defineInvestmentPlugin<TInput, TOutput>(plugin: InvestmentCalculatorPlugin<TInput, TOutput>): InvestmentCalculatorPlugin<TInput, TOutput> {
  return Object.freeze(plugin);
}

export function investmentManifest(
  manifest: Omit<InvestmentCalculatorManifest, "category" | "version" | "routeSegment" | "presets"> & { readonly routeSegment?: string },
): InvestmentCalculatorManifest {
  return {
    ...manifest,
    category: "investment",
    version: "1.0.0",
    routeSegment: manifest.routeSegment ?? manifest.id,
    presets: [],
  };
}
