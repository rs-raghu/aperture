"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { getCalculatorPresentation } from "@aperture/calculators";
import { FinanceErrorBanner, FinanceField, FinancePageHeader, FinancePanel, FinanceSelectInput, FinanceTextInput, humanize } from "../components/ui";
import { useFinance } from "../providers/finance-provider";
import { normalizeFinanceUiError, type FinanceUiError } from "../view-models/finance-error";

type PathSegment = string | number;

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Readonly<Record<string, unknown>> : null;
}

function replaceAtPath(value: unknown, path: readonly PathSegment[], replacement: unknown): unknown {
  const [head, ...tail] = path;
  if (head === undefined) return replacement;
  if (Array.isArray(value) && typeof head === "number") return value.map((entry, index) => index === head ? replaceAtPath(entry, tail, replacement) : entry);
  const object = objectValue(value);
  if (object && typeof head === "string") return Object.fromEntries(Object.entries(object).map(([key, entry]) => [key, key === head ? replaceAtPath(entry, tail, replacement) : entry]));
  return value;
}

function inputId(path: readonly PathSegment[]): string { return `calculator-${path.join("-")}`; }
function pathLabel(path: readonly PathSegment[]): string { return path.map((part) => typeof part === "number" ? `item ${part + 1}` : humanize(part)).join(" · "); }

function InputTree({ value, path = [], onChange }: { readonly value: unknown; readonly path?: readonly PathSegment[]; readonly onChange: (path: readonly PathSegment[], value: unknown) => void }) {
  if (Array.isArray(value)) return <fieldset className="calculator-fieldset"><legend>{pathLabel(path)}</legend>{value.map((entry, index) => <InputTree key={index} value={entry} path={[...path, index]} onChange={onChange} />)}</fieldset>;
  const object = objectValue(value);
  if (object) return <fieldset className="calculator-fieldset"><legend>{path.length === 0 ? "Inputs" : pathLabel(path)}</legend>{Object.entries(object).map(([key, entry]) => <InputTree key={key} value={entry} path={[...path, key]} onChange={onChange} />)}</fieldset>;
  const id = inputId(path);
  const label = pathLabel(path);
  if (typeof value === "boolean") return <FinanceField label={label} name={id} hint="Toggle this assumption on or off."><input id={id} name={id} type="checkbox" checked={value} onChange={(event) => onChange(path, event.target.checked)} /></FinanceField>;
  if (typeof value === "number") return <FinanceTextInput label={label} name={id} type="number" value={String(value)} hint="A numeric input used by the validated calculation." onChange={(event) => onChange(path, event.target.value === "" ? "" : Number(event.target.value))} />;
  return <FinanceTextInput label={label} name={id} value={typeof value === "string" ? value : ""} hint="Enter the value explicitly; decimal text is preserved." onChange={(event) => onChange(path, event.target.value)} />;
}

function OutputTree({ value, label = "Result" }: { readonly value: unknown; readonly label?: string }) {
  if (Array.isArray(value)) return <div className="result-group"><h4>{label}</h4>{value.map((entry, index) => <OutputTree key={index} value={entry} label={`Item ${index + 1}`} />)}</div>;
  const object = objectValue(value);
  if (object) {
    if (typeof object.amount === "string" && typeof object.currency === "string") return <div className="result-row"><span>{label}</span><strong>{object.currency} {object.amount}</strong></div>;
    if (typeof object.value === "string" && typeof object.representation === "string") return <div className="result-row"><span>{label}</span><strong>{object.value}{object.representation === "human_percentage" ? "%" : ""}</strong></div>;
    return <div className="result-group"><h4>{label}</h4>{Object.entries(object).filter(([key]) => key !== "metadata").map(([key, entry]) => <OutputTree key={key} value={entry} label={humanize(key)} />)}</div>;
  }
  return <div className="result-row"><span>{label}</span><strong>{String(value)}</strong></div>;
}

export function CalculatorScreen({ calculatorId }: { readonly calculatorId: string }) {
  const calculator = getCalculatorPresentation(calculatorId);
  if (!calculator) return <><FinancePageHeader eyebrow="Calculator Hub" title="Calculator not found" description="The requested calculator is not registered." /><Link className="button button-secondary" href="/calculators">Return to Calculator Hub</Link></>;
  return <RegisteredCalculatorScreen calculator={calculator} />;
}

function RegisteredCalculatorScreen({ calculator }: { readonly calculator: NonNullable<ReturnType<typeof getCalculatorPresentation>> }) {
  const { service, context, favorites, toggleFavorite, recordCalculatorUse, rememberScenario, savedScenarios } = useFinance();
  const initialInput = useMemo(() => structuredClone(calculator.exampleInput), [calculator]);
  const [input, setInput] = useState<Readonly<Record<string, unknown>>>(initialInput);
  const [output, setOutput] = useState<unknown>(null);
  const [error, setError] = useState<FinanceUiError | null>(null);
  const [scenarioName, setScenarioName] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const scenarios = savedScenarios.filter(({ calculatorId }) => calculatorId === calculator.id);
  const [leftId, setLeftId] = useState(""); const [rightId, setRightId] = useState("");
  const update = (path: readonly PathSegment[], value: unknown) => { const next = replaceAtPath(input, path, value); const object = objectValue(next); if (object) setInput(object); };
  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(null); setSaveStatus("");
    const parsed = calculator.inputSchema.safeParse(input);
    if (!parsed.success) { setError(normalizeFinanceUiError(parsed.error)); return; }
    try { setOutput(calculator.calculate(parsed.data)); recordCalculatorUse(calculator.id); } catch (caught) { setError(normalizeFinanceUiError(caught)); }
  };
  const reset = () => { setInput(structuredClone(calculator.exampleInput)); setOutput(null); setError(null); setSaveStatus(""); };
  const save = async () => {
    if (output === null) { setError({ message: "Run the calculator before saving a scenario.", fieldErrors: {} }); return; }
    const name = scenarioName.trim();
    if (!name) { setError({ message: "Enter a scenario name before saving.", fieldErrors: { scenarioName: "Enter a scenario name." } }); return; }
    try {
      if (calculator.supportsFinanceScenario) await service.scenarios.create(context, { calculatorId: calculator.id, calculatorVersion: calculator.version, name, input });
      const saved = rememberScenario({ calculatorId: calculator.id, name, input, output });
      setScenarioName(""); setSaveStatus(`Saved ${saved.name}.`); setError(null);
    } catch (caught) { setError(normalizeFinanceUiError(caught)); }
  };
  const left = scenarios.find(({ id }) => id === leftId); const right = scenarios.find(({ id }) => id === rightId);
  const assumptions = [...calculator.assumptions];
  const metadata = objectValue(output)?.metadata; const metadataObject = objectValue(metadata); const warnings = metadataObject?.warnings;
  return <>
    <Link className="back-link" href="/calculators">← Calculator Hub</Link>
    <FinancePageHeader eyebrow={calculator.categoryLabel} title={calculator.title} description={calculator.description} />
    <div className="calculator-toolbar"><button className="button button-secondary" aria-pressed={favorites.has(calculator.id)} onClick={() => toggleFavorite(calculator.id)}>{favorites.has(calculator.id) ? "★ Favorite" : "☆ Add favorite"}</button><span>Example: {calculator.exampleName}</span></div>
    <FinanceErrorBanner error={error} />
    <div className="calculator-layout">
      <FinancePanel title="Inputs" description="Every assumption is editable. Nested rows come from the calculator's tested example shape."><form className="calculator-form" onSubmit={calculate}><InputTree value={input} onChange={update} /><div className="record-actions"><button className="button button-primary finance-button" type="submit">Calculate</button><button className="button button-ghost" type="button" onClick={reset}>Reset</button></div></form></FinancePanel>
      <div className="calculator-results"><FinancePanel title="Result summary" description="Decimal values are rendered directly from the typed result.">{output === null ? <p className="muted-copy">Enter assumptions and calculate to see a result.</p> : <OutputTree value={output} />}</FinancePanel>
        <FinancePanel title="Save scenario" description={calculator.supportsFinanceScenario ? "Saved through the owner-scoped Finance repository." : "Academic scenarios stay in this app session."}><FinanceTextInput label="Scenario name" name="scenarioName" value={scenarioName} error={error?.fieldErrors.scenarioName} onChange={(event) => setScenarioName(event.target.value)} /><button className="button button-secondary" type="button" onClick={() => void save()}>Save scenario</button>{saveStatus && <p className="success-message" role="status">{saveStatus}</p>}</FinancePanel>
      </div>
    </div>
    <div className="grid grid-2"><FinancePanel title="Formula & breakdown"><p className="formula">{calculator.formula}</p><p>The result groups above expose every output field returned by the registered calculator, including component totals and scenario rows.</p></FinancePanel><FinancePanel title="Assumptions & disclosures"><ul className="disclosure-list">{assumptions.map((item) => <li key={item}>{item}</li>)}{Array.isArray(warnings) && warnings.map((item, index) => <li key={`warning-${index}`}>{String(item)}</li>)}</ul></FinancePanel></div>
    {scenarios.length >= 2 && <FinancePanel title="Compare scenarios" description="Choose two saved runs to inspect their complete outputs side by side."><div className="calculator-filters"><FinanceSelectInput label="First scenario" name="leftScenario" value={leftId} onChange={(event) => setLeftId(event.target.value)}><option value="">Choose scenario</option>{scenarios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</FinanceSelectInput><FinanceSelectInput label="Second scenario" name="rightScenario" value={rightId} onChange={(event) => setRightId(event.target.value)}><option value="">Choose scenario</option>{scenarios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</FinanceSelectInput></div>{left && right && <div className="grid grid-2"><div><h3>{left.name}</h3><OutputTree value={left.output} /></div><div><h3>{right.name}</h3><OutputTree value={right.output} /></div></div>}</FinancePanel>}
  </>;
}
