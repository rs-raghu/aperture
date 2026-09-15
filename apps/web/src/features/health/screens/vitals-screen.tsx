"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import type { VitalReadingType, VitalReadingValue } from "@aperture/health";
import { useHealth } from "../providers/health-provider";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, SelectInput, SubmitButton, TextInput, formatDateTime, quantity, toIsoTimestamp } from "../components/ui";

const vitalTypes: readonly VitalReadingType[] = ["resting_heart_rate", "blood_pressure", "blood_glucose", "oxygen_saturation", "body_temperature"];

function buildReading(type: VitalReadingType, primary: string, secondary: string): VitalReadingValue {
  switch (type) {
    case "resting_heart_rate": return { type, value: { value: Number(primary), unit: "beats_per_minute" } };
    case "blood_pressure": return { type, value: { systolic: Number(primary), diastolic: Number(secondary), unit: "millimeters_of_mercury" } };
    case "blood_glucose": return { type, value: { value: primary, unit: "milligrams_per_deciliter" } };
    case "oxygen_saturation": return { type, value: { value: primary, unit: "percent" } };
    case "body_temperature": return { type, value: { value: primary, unit: "celsius" } };
  }
}

function readingText(reading: VitalReadingValue): string {
  return reading.type === "blood_pressure"
    ? `${reading.value.systolic}/${reading.value.diastolic} mmHg`
    : quantity(reading.value);
}

export function VitalsScreen() {
  const { service, context } = useHealth();
  const action = useHealthAction();
  const [type, setType] = useState<VitalReadingType>("resting_heart_rate");
  const [filter, setFilter] = useState("");
  const load = useCallback(async () => (await service.listVitalReadings(context)).items, [service, context]);
  const query = useHealthQuery(load);
  const visible = useMemo(() => (query.data ?? []).filter((item) => !filter || item.reading.type === filter), [query.data, filter]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    void action.execute(() => service.recordVitalReading(context, {
      reading: buildReading(type, String(form.get("primary")), String(form.get("secondary") ?? "")),
      observedAt: toIsoTimestamp(String(form.get("observedAt"))),
    })).then((result) => { if (result) element.reset(); });
  };

  return <>
    <PageHeader eyebrow="Recorded observations" title="Vital signs" description="Capture user-supplied vital readings. Values remain observations and are never classified or diagnosed here." />
    <div className="grid grid-2">
      <Panel title="Record vital reading" description="Select a type to use its structural unit.">
        <ErrorBanner error={action.error} />
        <form className="form-grid" onSubmit={submit}>
          <SelectInput label="Vital type *" name="vitalType" value={type} onChange={(event) => setType(event.target.value as VitalReadingType)}>{vitalTypes.map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</SelectInput>
          <TextInput label={type === "blood_pressure" ? "Systolic *" : "Value *"} name="primary" inputMode="decimal" required />
          {type === "blood_pressure" && <TextInput label="Diastolic *" name="secondary" inputMode="numeric" required />}
          <TextInput label="Observed at *" name="observedAt" type="datetime-local" required />
          <div className="form-actions"><SubmitButton pending={action.pending}>Record vital</SubmitButton></div>
        </form>
      </Panel>
      <Panel title="Vital history" description="Filters use the repository's supported type field.">
        <SelectInput label="Filter by type" name="vitalFilter" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All vital types</option>{vitalTypes.map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</SelectInput>
        <ErrorBanner error={query.error} />
        {query.loading ? <LoadingState /> : visible.length === 0 ? <EmptyState title="No vital readings found" description="Record a vital reading or change the current filter." /> : <ul className="record-list health-record-gap">{visible.map((item) => <li className="record-card" key={item.id}><div><h3>{item.reading.type.replaceAll("_", " ")}</h3><p>{readingText(item.reading)} · {formatDateTime(item.observedAt)}</p></div><button className="button button-small button-danger" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.deleteVitalReading(context, item.id))}>Delete</button></li>)}</ul>}
      </Panel>
    </div>
  </>;
}
