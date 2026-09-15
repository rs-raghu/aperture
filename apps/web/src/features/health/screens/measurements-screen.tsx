"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import type { HealthMeasurementType } from "@aperture/health";
import { useHealth } from "../providers/health-provider";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, SelectInput, SubmitButton, TextInput, formatDateTime, quantity, toIsoTimestamp } from "../components/ui";

const measurementTypes: readonly HealthMeasurementType[] = ["weight", "height", "waist", "hip"];

export function MeasurementsScreen() {
  const { service, context } = useHealth();
  const action = useHealthAction();
  const [filter, setFilter] = useState("");
  const load = useCallback(async () => (await service.listHealthMeasurements(context)).items, [service, context]);
  const query = useHealthQuery(load);
  const visible = useMemo(() => (query.data ?? []).filter((item) => !filter || item.type === filter), [query.data, filter]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const type = String(form.get("type")) as HealthMeasurementType;
    const unit = type === "weight" ? "kilogram" as const : type === "height" ? "centimeter" as const : "meter" as const;
    void action.execute(() => service.recordHealthMeasurement(context, {
      type,
      measurement: { value: String(form.get("value")), unit },
      observedAt: toIsoTimestamp(String(form.get("observedAt"))),
    })).then((result) => { if (result) element.reset(); });
  };

  return <>
    <PageHeader eyebrow="Body record" title="Measurements" description="Store unusual as well as typical structurally valid values. The preview records observations without interpreting them." />
    <div className="grid grid-2">
      <Panel title="Record measurement" description="Units follow the selected measurement type.">
        <ErrorBanner error={action.error} />
        <form className="form-grid" onSubmit={submit}>
          <SelectInput label="Measurement type *" name="type">{measurementTypes.map((type) => <option value={type} key={type}>{type}</option>)}</SelectInput>
          <TextInput label="Value *" name="value" inputMode="decimal" placeholder="70.25" required />
          <TextInput className="field-full" label="Observed at *" name="observedAt" type="datetime-local" required />
          <div className="form-actions"><SubmitButton pending={action.pending}>Record measurement</SubmitButton></div>
        </form>
      </Panel>
      <Panel title="Measurement history" description="Filter locally by recorded type.">
        <SelectInput label="Filter by type" name="measurementFilter" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All types</option>{measurementTypes.map((type) => <option value={type} key={type}>{type}</option>)}</SelectInput>
        <ErrorBanner error={query.error} />
        {query.loading ? <LoadingState /> : visible.length === 0 ? <EmptyState title="No measurements found" description="Record a measurement or change the current filter." /> : <ul className="record-list health-record-gap">{visible.map((item) => <li className="record-card" key={item.id}><div><h3>{item.type}</h3><p>{quantity(item.measurement)} · {formatDateTime(item.observedAt)}</p></div><div className="record-actions"><button className="button button-small button-danger" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.deleteHealthMeasurement(context, item.id))}>Delete</button></div></li>)}</ul>}
      </Panel>
    </div>
  </>;
}
