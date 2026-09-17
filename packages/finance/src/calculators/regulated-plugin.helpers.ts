import type { CalculatorWarning } from "./calculator.types.js";
import type { RegulatedCalculatorManifest, RegulatedCalculatorPlugin } from "./regulated-plugin.types.js";

export function defineRegulatedPlugin<TInput, TOutput>(plugin: RegulatedCalculatorPlugin<TInput, TOutput>): RegulatedCalculatorPlugin<TInput, TOutput> {
  return Object.freeze(plugin);
}

export function regulatedManifest(manifest: Omit<RegulatedCalculatorManifest, "version" | "presets">): RegulatedCalculatorManifest {
  return { ...manifest, version: "1.0.0", presets: [] };
}

export function disclosureWarnings(...messages: readonly string[]): readonly CalculatorWarning[] {
  return messages.map((message, index) => ({ code: `calculation_disclosure_${index + 1}`, message }));
}
