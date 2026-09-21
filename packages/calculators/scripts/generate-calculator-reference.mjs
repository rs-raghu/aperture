import { readFileSync } from "node:fs";
import { allCalculatorPresentations } from "../dist/runtime.js";
import { allFinanceCalculatorPlugins } from "../../finance/dist/runtime.js";

const financeById = new Map(allFinanceCalculatorPlugins.map((plugin) => [plugin.manifest.id, plugin]));
const foundationIds = new Set(["cagr", "compound-interest", "emi", "flat-vs-reducing-rate", "home-loan-emi", "car-loan-emi", "inflation-adjusted-value", "lumpsum", "roi", "simple-interest", "sip", "swp", "xirr"]);

function objectValue(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
}

function quote(value) {
  return `\`${String(value).replaceAll("`", "\\`")}\``;
}

function describeScalar(path, value) {
  const lower = path.toLocaleLowerCase();
  if (typeof value === "number") return `${quote(path)} — safe integer (${value})`;
  if (typeof value === "boolean") return `${quote(path)} — boolean (${String(value)})`;
  if (value === null) return `${quote(path)} — nullable value`;
  if (typeof value !== "string") return `${quote(path)} — ${typeof value}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return `${quote(path)} — ISO date/time (${quote(value)})`;
  if (/^-?\d+(\.\d+)?$/.test(value)) return `${quote(path)} — exact decimal string (${quote(value)})`;
  if (lower.endsWith("currency")) return `${quote(path)} — ISO 4217 currency code (${quote(value)})`;
  if (lower.includes("version")) return `${quote(path)} — version identifier (${quote(value)})`;
  return `${quote(path)} — enum or text (${quote(value)})`;
}

function describeFields(value, path = "") {
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${quote(`${path}[]`)} — optional caller metadata; empty in the reference example`];
    return describeFields(value[0], `${path}[]`);
  }
  const object = objectValue(value);
  if (!object) return [describeScalar(path, value)];
  if (typeof object.amount === "string" && typeof object.currency === "string") return [`${quote(path)} — money as an exact decimal string plus ISO 4217 currency (${quote(`${object.currency} ${object.amount}`)})`];
  if (typeof object.value === "string" && typeof object.representation === "string") {
    const period = typeof object.period === "string" ? ` per ${object.period}` : "";
    const frequency = typeof object.compoundingFrequency === "string" ? `, ${object.compoundingFrequency} compounding` : "";
    return [`${quote(path)} — ${object.representation.replaceAll("_", " ")} as an exact decimal string${period}${frequency} (${quote(object.value)})`];
  }
  return Object.entries(object).flatMap(([key, entry]) => describeFields(entry, path ? `${path}.${key}` : key));
}

function outputWarnings(output) {
  const metadata = objectValue(objectValue(output)?.metadata);
  const warnings = Array.isArray(metadata?.warnings) ? metadata.warnings : [];
  return warnings.flatMap((warning) => {
    const item = objectValue(warning);
    return typeof item?.message === "string" ? [item.message] : [];
  });
}

function testReferences(calculator) {
  const references = ["`packages/calculators/test/integration-hardening.test.ts`", "`apps/web/tests/calculator-hub.test.tsx`", "`apps/mobile/tests/calculator-hub.test.tsx`"];
  if (calculator.category === "academic") references.unshift("`packages/education/test/education-calculations.test.ts`");
  else if (calculator.category === "retirement") references.unshift("`packages/finance/test/retirement-calculators.test.ts`");
  else if (financeById.get(calculator.id)?.manifest.category === "investment") references.unshift("`packages/finance/test/investment-calculators.test.ts`");
  else references.unshift("`packages/finance/test/regulated-calculators.test.ts`");
  if (foundationIds.has(calculator.id)) references.unshift("`packages/finance/test/calculation-foundation.test.ts`");
  return references.join(", ");
}

function presetText(calculator, input) {
  const plugin = financeById.get(calculator.id);
  if (!plugin) return "Not applicable; academic scale and rounding are explicit inputs.";
  const manifest = plugin.manifest;
  const government = "governmentScheme" in manifest && manifest.governmentScheme;
  const ruleVersion = typeof input.ruleVersion === "string" ? input.ruleVersion : typeof input.taxRuleVersion === "string" ? input.taxRuleVersion : undefined;
  const effectiveOn = typeof input.ruleEffectiveOn === "string" ? input.ruleEffectiveOn : undefined;
  const exampleRule = ruleVersion ? ` Reference input uses caller rule ${quote(ruleVersion)}${effectiveOn ? ` effective ${quote(effectiveOn)}` : ""}.` : "";
  return `${manifest.presets.length === 0 ? "None embedded" : `${manifest.presets.length} versioned preset(s)`}; calculator version ${quote(manifest.version)}.${government ? " Government rate or rule values must be supplied by the caller." : ""}${exampleRule}`;
}

const sections = allCalculatorPresentations.map((calculator, index) => {
  const input = objectValue(calculator.exampleInput) ?? {};
  const output = calculator.calculate(calculator.exampleInput);
  const financePlugin = financeById.get(calculator.id);
  const assumptions = [...new Set([...calculator.assumptions, ...outputWarnings(output)])];
  const inputs = describeFields(input).map((entry) => `  - ${entry}`).join("\n");
  const outputs = describeFields(output).filter((entry) => !entry.startsWith("`metadata.")).map((entry) => `  - ${entry}`).join("\n");
  const metadataField = financePlugin ? `\n  - ${quote("metadata")} — calculator ID, version, estimate flag, assumptions, sources, and warnings.` : "";
  const exampleStatement = financePlugin
    ? "The input schema accepts the example and the result equals the plug-in's registered expected output."
    : "The Education input schema accepts the example and the shared calculation returns the documented output shape.";
  return `## ${index + 1}. ${calculator.title} (${quote(calculator.id)})

- **Presentation category:** ${calculator.categoryLabel}
- **Calculator version:** ${quote(calculator.version)}
- **Formula:** ${calculator.formula}
- **Preset/version policy:** ${presetText(calculator, input)}
- **Reference example:** ${calculator.exampleName}. ${exampleStatement}
- **Assumptions and disclosures:** ${assumptions.length > 0 ? assumptions.join(" ") : "No hidden assumptions; all values are explicit inputs."}
- **Inputs and units:**
${inputs}
- **Output fields:**
${outputs}
${metadataField}
- **Test references:** ${testReferences(calculator)}
`;
});

const document = `# Calculator reference

This reference is generated from the shared calculator presentation registry used by web and Expo. It covers all ${allCalculatorPresentations.length} calculators in nine presentation categories. Formula text, reference inputs, output shapes, warnings, versions, and preset policy come from executable package definitions rather than UI copies.

## Shared conventions

- Money and precision-sensitive rates are serialized as decimal strings. JavaScript numbers are limited to validated safe integers such as counts and ages.
- Percentages state their representation. Interest rates also state their period and compounding frequency when applicable.
- The Finance foundation uses 50-digit decimal precision, half-even internal rounding, Actual/365 Fixed for XIRR/NPV, positive inflows and negative outflows, and explicit contribution/payment timing.
- A calculator rounds only when its contract contains an explicit rounding policy. UI layers display returned decimal strings without re-rounding.
- All 36 Finance calculators return result metadata. Every estimate includes the shared ${quote("estimate_not_advice")} disclosure plus any calculator-specific warnings.
- No current government rate or tax-law preset is embedded. Government calculators require caller-supplied rates or effective-dated rules; Income Tax and HRA carry caller rule identifiers and effective dates.
- GPA and CGPA call the Education calculation package and use its explicit scale and rounding inputs.

## Test map

- Foundation precision, rounding, sign, date, timing, rate-conversion, and reference cases: ${quote("packages/finance/test/calculation-foundation.test.ts")}.
- Finance calculator examples and boundary cases: ${quote("packages/finance/test/investment-calculators.test.ts")}, ${quote("packages/finance/test/regulated-calculators.test.ts")}, and ${quote("packages/finance/test/retirement-calculators.test.ts")}.
- Cross-registry metadata, serialization, government policy, and tax metadata: ${quote("packages/calculators/test/integration-hardening.test.ts")}.
- Academic formulas: ${quote("packages/education/test/education-calculations.test.ts")}.
- Shared web/mobile registry execution and scenario behavior: ${quote("apps/web/tests/calculator-hub.test.tsx")} and ${quote("apps/mobile/tests/calculator-hub.test.tsx")}.

${sections.join("\n")}`;

if (process.argv.includes("--check")) {
  const committed = readFileSync(new URL("../../../docs/CALCULATOR_REFERENCE.md", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  if (committed !== document) {
    process.stderr.write("docs/CALCULATOR_REFERENCE.md is out of date. Regenerate it from the shared calculator registry.\n");
    process.exitCode = 1;
  }
} else {
  process.stdout.write(document);
}
