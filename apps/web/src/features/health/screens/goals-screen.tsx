"use client";

import { useCallback, type FormEvent } from "react";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, SelectInput, SubmitButton, TextInput, formatDateTime, quantity, toIsoTimestamp } from "../components/ui";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { useHealth } from "../providers/health-provider";

export function GoalsScreen() {
  const { service, context } = useHealth();
  const action = useHealthAction();
  const load = useCallback(async () => {
    const [records, recovery] = await Promise.all([service.listPersonalRecords(context), service.listRecoveryEntries(context)]);
    return { records: records.items, recovery: recovery.items };
  }, [service, context]);
  const query = useHealthQuery(load);

  const submitRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const metricType = String(form.get("metricType"));
    const value = String(form.get("metricValue"));
    const metric = metricType === "weight"
      ? { type: "weight" as const, value: { value, unit: "kilogram" as const } }
      : { type: "distance" as const, value: { value, unit: "kilometer" as const } };
    void action.execute(() => service.recordPersonalRecord(context, {
      title: String(form.get("recordTitle")),
      metric,
      achievedAt: toIsoTimestamp(String(form.get("achievedAt"))),
    })).then((result) => { if (result) element.reset(); });
  };

  const submitRecovery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    void action.execute(() => service.recordRecoveryEntry(context, {
      observedAt: toIsoTimestamp(String(form.get("observedAt"))),
      energy: { value: Number(form.get("energy")), scale: "one_to_ten" },
      fatigue: { value: Number(form.get("fatigue")), scale: "one_to_ten" },
    })).then((result) => { if (result) element.reset(); });
  };

  return <>
    <PageHeader eyebrow="Progress log" title="Goals & progress" description="Use achieved personal records and recovery observations to follow progress. Target-setting is not part of the current Health contract." />
    <ErrorBanner error={query.error ?? action.error} />
    <div className="grid grid-2">
      <Panel title="Add achieved record" description="Log a completed milestone; this does not prescribe a target.">
        <form className="form-grid" onSubmit={submitRecord}>
          <TextInput label="Milestone title *" name="recordTitle" required />
          <SelectInput label="Metric *" name="metricType"><option value="distance">Distance in km</option><option value="weight">Weight in kg</option></SelectInput>
          <TextInput label="Metric value *" name="metricValue" inputMode="decimal" required />
          <TextInput label="Achieved at *" name="achievedAt" type="datetime-local" required />
          <div className="form-actions"><SubmitButton pending={action.pending}>Add record</SubmitButton></div>
        </form>
      </Panel>
      <Panel title="Add recovery observation" description="Ratings are personal observations from 1 to 10.">
        <form className="form-grid" onSubmit={submitRecovery}>
          <TextInput label="Observed at *" name="observedAt" type="datetime-local" required />
          <TextInput label="Energy (1–10) *" name="energy" type="number" min="1" max="10" required />
          <TextInput label="Fatigue (1–10) *" name="fatigue" type="number" min="1" max="10" required />
          <div className="form-actions"><SubmitButton pending={action.pending}>Add observation</SubmitButton></div>
        </form>
      </Panel>
      <Panel title="Achieved records">
        {query.loading ? <LoadingState /> : !query.data?.records.length ? <EmptyState title="No achieved records" description="Add a factual milestone when one is completed." /> : <ul className="record-list">{query.data.records.map((item) => <li className="record-card" key={item.id}><div><h3>{item.title}</h3><p>{item.metric.type} · {quantity(item.metric.value)} · {formatDateTime(item.achievedAt)}</p></div><button className="button button-small button-danger" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.deletePersonalRecord(context, item.id))}>Delete</button></li>)}</ul>}
      </Panel>
      <Panel title="Recovery observations">
        {query.loading ? <LoadingState /> : !query.data?.recovery.length ? <EmptyState title="No recovery observations" description="Add an observation to begin the log." /> : <ul className="record-list">{query.data.recovery.map((item) => <li className="record-card" key={item.id}><div><h3>{formatDateTime(item.observedAt)}</h3><p>Energy {item.energy?.value ?? "—"}/10 · Fatigue {item.fatigue?.value ?? "—"}/10</p></div><button className="button button-small button-danger" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.deleteRecoveryEntry(context, item.id))}>Delete</button></li>)}</ul>}
      </Panel>
    </div>
  </>;
}
