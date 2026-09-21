import { useMemo, useState } from "react";
import { getCalculatorPresentation, type CalculatorPresentationDefinition } from "@aperture/calculators";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, ChoiceField, ErrorBanner, NavigationCard, PageHeader, Panel, PreviewNotice, RecordCard, RecordList, Screen, SuccessMessage, TextField, humanize } from "../components/ui";
import { useFinance } from "../providers/finance-provider";
import { financeColors as colors, financeSpacing as spacing } from "../styles/tokens";
import { normalizeFinanceMobileError, type FinanceMobileError } from "../view-models/finance-error";

type PathSegment = string | number;

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (typeof value === "object" && value !== null) return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]));
  return value;
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return Object.fromEntries(Object.entries(value));
}

function cloneRecord(value: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]));
}

function replaceAtPath(value: unknown, path: readonly PathSegment[], replacement: unknown): unknown {
  const [head, ...tail] = path;
  if (head === undefined) return replacement;
  if (Array.isArray(value) && typeof head === "number") return value.map((entry, index) => index === head ? replaceAtPath(entry, tail, replacement) : entry);
  const object = objectValue(value);
  if (object && typeof head === "string") return Object.fromEntries(Object.entries(object).map(([key, entry]) => [key, key === head ? replaceAtPath(entry, tail, replacement) : entry]));
  return value;
}

function pathLabel(path: readonly PathSegment[]): string { return path.map((part) => typeof part === "number" ? `item ${part + 1}` : humanize(part)).join(" · "); }
function numericLabel(label: string): boolean { return /(amount|rate|percent|price|principal|balance|income|salary|cost|value|credit|gpa|point|year|month|age|term|tenure|corpus|contribution|inflation|return|frequency|quantity|units|tax|deduction|rent|premium)/i.test(label); }

function InputTree({ value, path = [], onChange }: { readonly value: unknown; readonly path?: readonly PathSegment[]; readonly onChange: (path: readonly PathSegment[], value: unknown) => void }) {
  if (Array.isArray(value)) return <View style={styles.group}><Text style={styles.groupTitle}>{pathLabel(path)}</Text>{value.map((entry, index) => <InputTree key={index} value={entry} path={[...path, index]} onChange={onChange} />)}</View>;
  const object = objectValue(value);
  if (object) return <View style={styles.group}><Text style={styles.groupTitle}>{path.length === 0 ? "Inputs" : pathLabel(path)}</Text>{Object.entries(object).map(([key, entry]) => <InputTree key={key} value={entry} path={[...path, key]} onChange={onChange} />)}</View>;
  const label = pathLabel(path); const name = `calculator-${path.join("-")}`;
  if (typeof value === "boolean") return <ChoiceField label={label} value={value ? "yes" : "no"} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} onChange={(next) => onChange(path, next === "yes")} />;
  if (typeof value === "number") return <TextField label={label} name={name} value={String(value)} keyboardType="decimal-pad" hint="A numeric input used by the validated calculation." onChangeText={(next) => onChange(path, next === "" ? "" : Number(next))} />;
  const text = typeof value === "string" ? value : "";
  return <TextField label={label} name={name} value={text} keyboardType={numericLabel(label) ? "decimal-pad" : "default"} hint="Enter the value explicitly; decimal text is preserved." onChangeText={(next) => onChange(path, next)} />;
}

function primitiveText(value: unknown): string {
  if (value === null) return "None";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
  return "Unavailable";
}

function OutputTree({ value, label = "Result" }: { readonly value: unknown; readonly label?: string }) {
  if (Array.isArray(value)) return <View style={styles.outputGroup}><Text style={styles.groupTitle}>{label}</Text><RecordList items={value.map((entry, index) => ({ entry, index }))} keyExtractor={({ index }) => String(index)} accessibilityLabel={`${label} result rows`} renderItem={({ entry, index }) => <OutputTree value={entry} label={`Item ${index + 1}`} />} /></View>;
  const object = objectValue(value);
  if (object) {
    if (typeof object.amount === "string" && typeof object.currency === "string") return <RecordCard title={label} details={[`${object.currency} ${object.amount}`]} />;
    if (typeof object.value === "string" && typeof object.representation === "string") return <RecordCard title={label} details={[`${object.value}${object.representation === "human_percentage" ? "%" : ""}`]} />;
    return <View style={styles.outputGroup}><Text style={styles.groupTitle}>{label}</Text>{Object.entries(object).filter(([key]) => key !== "metadata").map(([key, entry]) => <OutputTree key={key} value={entry} label={humanize(key)} />)}</View>;
  }
  return <RecordCard title={label} details={[primitiveText(value)]} />;
}

export function CalculatorScreen({ calculatorId }: { readonly calculatorId: string }) {
  const calculator = getCalculatorPresentation(calculatorId);
  if (!calculator) return <Screen testID="calculator-not-found-screen"><PageHeader eyebrow="Calculator Hub" title="Calculator not found" description="The requested calculator is not registered." /><NavigationCard href="/calculators" title="Return to Calculator Hub" description="Browse all 38 calculators." /></Screen>;
  return <RegisteredCalculatorScreen calculator={calculator} />;
}

function RegisteredCalculatorScreen({ calculator }: { readonly calculator: CalculatorPresentationDefinition }) {
  const { service, context, favorites, toggleFavorite, recordCalculatorUse, rememberScenario, savedScenarios } = useFinance();
  const initialInput = useMemo(() => cloneRecord(calculator.exampleInput), [calculator]);
  const [input, setInput] = useState<Readonly<Record<string, unknown>>>(initialInput); const [output, setOutput] = useState<unknown>(null); const [error, setError] = useState<FinanceMobileError | null>(null); const [scenarioName, setScenarioName] = useState(""); const [saveStatus, setSaveStatus] = useState(""); const [leftId, setLeftId] = useState(""); const [rightId, setRightId] = useState("");
  const scenarios = savedScenarios.filter(({ calculatorId }) => calculatorId === calculator.id);
  const update = (path: readonly PathSegment[], value: unknown) => { const next = objectValue(replaceAtPath(input, path, value)); if (next) setInput(next); };
  const calculate = () => { setError(null); setSaveStatus(""); const parsed = calculator.inputSchema.safeParse(input); if (!parsed.success) { setError(normalizeFinanceMobileError(parsed.error)); return; } try { setOutput(calculator.calculate(parsed.data)); recordCalculatorUse(calculator.id); } catch (caught) { setError(normalizeFinanceMobileError(caught)); } };
  const reset = () => { setInput(cloneRecord(calculator.exampleInput)); setOutput(null); setError(null); setSaveStatus(""); };
  const save = async () => { if (output === null) { setError({ message: "Run the calculator before saving a scenario.", fieldErrors: {} }); return; } const name = scenarioName.trim(); if (!name) { setError({ message: "Enter a scenario name before saving.", fieldErrors: { scenarioName: "Enter a scenario name." } }); return; } try { if (calculator.supportsFinanceScenario) await service.scenarios.create(context, { calculatorId: calculator.id, calculatorVersion: calculator.version, name, input }); const saved = rememberScenario({ calculatorId: calculator.id, name, input, output }); setScenarioName(""); setSaveStatus(`Saved ${saved.name} in this preview.`); setError(null); } catch (caught) { setError(normalizeFinanceMobileError(caught)); } };
  const left = scenarios.find(({ id }) => id === leftId); const right = scenarios.find(({ id }) => id === rightId); const metadata = objectValue(objectValue(output)?.metadata); const warnings = metadata?.warnings;
  return <Screen testID={`calculator-${calculator.id}-screen`}><NavigationCard href="/calculators" title="Calculator Hub" description="Return to search and categories." /><PageHeader eyebrow={calculator.categoryLabel} title={calculator.title} description={calculator.description} /><PreviewNotice /><ActionButton label={favorites.has(calculator.id) ? "★ Favorite" : "☆ Add favorite"} tone="secondary" pressed={favorites.has(calculator.id)} onPress={() => toggleFavorite(calculator.id)} /><Text style={styles.example}>Example: {calculator.exampleName}</Text><ErrorBanner error={error} />
    <Panel title="Inputs" description="Every assumption is editable. Nested rows use the calculator's tested example shape."><InputTree value={input} onChange={update} /><ActionButton label="Calculate" onPress={calculate} /><ActionButton label="Reset" tone="secondary" onPress={reset} /></Panel>
    <Panel title="Result summary" description="Long result sets scroll horizontally as accessible cards.">{output === null ? <Text style={styles.muted}>Enter assumptions and calculate to see a result.</Text> : <OutputTree value={output} />}</Panel>
    <Panel title="Save scenario" description={calculator.supportsFinanceScenario ? "Saved through the Finance service and memory repository." : "Academic scenarios stay in this preview runtime."}><TextField label="Scenario name" name="scenario-name" value={scenarioName} onChangeText={setScenarioName} error={error?.fieldErrors.scenarioName} /><ActionButton label="Save scenario" tone="secondary" onPress={() => void save()} />{saveStatus ? <SuccessMessage message={saveStatus} /> : null}</Panel>
    <Panel title="Formula and breakdown"><Text style={styles.formula} selectable>{calculator.formula}</Text><Text style={styles.muted}>The result cards expose every output field returned by the registered calculator.</Text></Panel>
    <Panel title="Assumptions and disclosures">{[...calculator.assumptions, ...(Array.isArray(warnings) ? warnings.map(String) : [])].map((item, index) => <Text key={`${index}-${item}`} style={styles.disclosure}>• {item}</Text>)}</Panel>
    {scenarios.length >= 2 ? <Panel title="Compare scenarios" description="Choose two saved runs to inspect their complete outputs as card alternatives."><ChoiceField label="First scenario" value={leftId} onChange={setLeftId} options={[{ value: "", label: "Choose scenario" }, ...scenarios.map((item) => ({ value: item.id, label: item.name }))]} /><ChoiceField label="Second scenario" value={rightId} onChange={setRightId} options={[{ value: "", label: "Choose scenario" }, ...scenarios.map((item) => ({ value: item.id, label: item.name }))]} />{left && right ? <><Panel title={left.name}><OutputTree value={left.output} /></Panel><Panel title={right.name}><OutputTree value={right.output} /></Panel></> : null}</Panel> : null}
  </Screen>;
}

const styles = StyleSheet.create({ group: { borderLeftColor: colors.border, borderLeftWidth: 2, paddingLeft: spacing.md, gap: spacing.md }, groupTitle: { color: colors.ink, fontWeight: "800", fontSize: 16 }, outputGroup: { gap: spacing.sm }, example: { color: colors.muted, fontWeight: "700" }, muted: { color: colors.muted, lineHeight: 21 }, formula: { color: colors.ink, fontFamily: "monospace", lineHeight: 22 }, disclosure: { color: colors.ink, lineHeight: 21 } });
