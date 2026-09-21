import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { allCalculatorPresentations, calculatorPresentationCategories } from "@aperture/calculators";
import { allFinanceCalculatorPlugins } from "@aperture/finance";

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return Object.fromEntries(Object.entries(value));
}

function assertPortableNumbers(value: unknown, path = "result"): void {
  if (typeof value === "number") {
    expect(Number.isSafeInteger(value), `${path} must use a decimal string unless it is a safe integer`).toBe(true);
    return;
  }
  if (Array.isArray(value)) { value.forEach((entry, index) => assertPortableNumbers(entry, `${path}[${index}]`)); return; }
  const object = objectValue(value);
  if (object) for (const [key, entry] of Object.entries(object)) assertPortableNumbers(entry, `${path}.${key}`);
}

function firstExample(calculatorId: string) {
  const plugin = allFinanceCalculatorPlugins.find(({ manifest }) => manifest.id === calculatorId);
  if (!plugin) throw new Error(`Missing Finance calculator ${calculatorId}.`);
  const example = plugin.examples[0];
  if (!example) throw new Error(`Missing example for ${calculatorId}.`);
  return { plugin, example };
}

describe("calculator integration hardening", () => {
  it("publishes the complete unique 38-calculator, nine-category surface", () => {
    expect(allCalculatorPresentations).toHaveLength(38);
    expect(new Set(allCalculatorPresentations.map(({ id }) => id)).size).toBe(38);
    expect(calculatorPresentationCategories).toHaveLength(9);
    expect(new Set(allCalculatorPresentations.map(({ category }) => category)).size).toBe(9);
    expect(allFinanceCalculatorPlugins).toHaveLength(36);
  });

  it("validates and executes every reference example with portable decimal serialization", () => {
    for (const calculator of allCalculatorPresentations) {
      expect(calculator.formula.trim().length, `${calculator.id} formula`).toBeGreaterThan(0);
      const parsed = calculator.inputSchema.safeParse(calculator.exampleInput);
      expect(parsed.success, `${calculator.id} example input`).toBe(true);
      if (!parsed.success) continue;
      const result = calculator.calculate(parsed.data);
      expect(result, `${calculator.id} result`).toBeDefined();
      assertPortableNumbers(calculator.exampleInput, `${calculator.id}.input`);
      assertPortableNumbers(result, `${calculator.id}.output`);
      const plugin = allFinanceCalculatorPlugins.find(({ manifest }) => manifest.id === calculator.id);
      if (plugin) {
        expect(plugin.outputSchema.safeParse(result).success, `${calculator.id} output schema`).toBe(true);
        expect(result).toEqual(plugin.examples[0]?.expected);
      }
    }
  });

  it("attaches identity, version, assumptions, sources, and no-advice disclosure to every Finance estimate", () => {
    for (const plugin of allFinanceCalculatorPlugins) {
      const output = Reflect.apply(plugin.calculate, undefined, [plugin.examples[0]?.input]);
      const metadata = objectValue(objectValue(output)?.metadata);
      expect(metadata?.calculatorId).toBe(plugin.manifest.id);
      expect(metadata?.version).toBe(plugin.manifest.version);
      expect(Array.isArray(metadata?.assumptions)).toBe(true);
      expect(Array.isArray(metadata?.sourceReferences)).toBe(true);
      const warnings = Array.isArray(metadata?.warnings) ? metadata.warnings : [];
      if (plugin.manifest.isEstimate) {
        expect(warnings.some((warning) => objectValue(warning)?.code === "estimate_not_advice"), `${plugin.manifest.id} disclosure`).toBe(true);
      }
    }
  });

  it("keeps government schemes preset-free and identifies caller-supplied rules or rates", () => {
    const government = allFinanceCalculatorPlugins.filter(({ manifest }) => "governmentScheme" in manifest && manifest.governmentScheme);
    expect(government.map(({ manifest }) => manifest.id).sort()).toEqual(["apy", "epf", "gratuity", "nps", "nsc", "post-office-mis", "ppf", "scss", "ssy"]);
    for (const plugin of government) {
      expect(plugin.manifest.presets, `${plugin.manifest.id} presets`).toEqual([]);
      expect("ratePolicy" in plugin.manifest ? plugin.manifest.ratePolicy : undefined).toBe("required_user_input");
      const output = Reflect.apply(plugin.calculate, undefined, [plugin.examples[0]?.input]);
      const warnings = objectValue(objectValue(output)?.metadata)?.warnings;
      expect(Array.isArray(warnings) && warnings.some((warning) => String(objectValue(warning)?.code).startsWith("user_supplied_")), `${plugin.manifest.id} caller warning`).toBe(true);
    }
  });

  it("carries effective tax-rule metadata without embedding current-law presets", () => {
    const incomeTax = firstExample("income-tax"); const incomeInput = objectValue(incomeTax.example.input);
    expect(incomeInput).toMatchObject({ financialYear: "2026-27", taxRuleVersion: "example-1", ruleEffectiveOn: "2026-04-01" });
    expect(incomeTax.plugin.manifest.presets).toEqual([]);
    const hra = firstExample("hra"); const hraInput = objectValue(hra.example.input);
    expect(hraInput).toMatchObject({ ruleVersion: "example-1", ruleEffectiveOn: "2026-01-01" });
    expect(hra.plugin.manifest.presets).toEqual([]);
  });

  it("documents every calculator with formula, units, outputs, preset policy, and tests", () => {
    const reference = readFileSync(new URL("../../../docs/CALCULATOR_REFERENCE.md", import.meta.url), "utf8");
    for (const calculator of allCalculatorPresentations) expect(reference, calculator.id).toContain(`(\`${calculator.id}\`)`);
    expect(reference.match(/^## \d+\./gm)).toHaveLength(38);
    for (const heading of ["Formula", "Preset/version policy", "Assumptions and disclosures", "Inputs and units", "Output fields", "Test references"]) {
      expect(reference.match(new RegExp(`\\*\\*${heading}:?\\*\\*`, "g")), heading).toHaveLength(38);
    }
  });
});
