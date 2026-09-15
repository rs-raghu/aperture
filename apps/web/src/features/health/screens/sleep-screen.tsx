"use client";

import { useCallback, type FormEvent } from "react";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, SelectInput, SubmitButton, TextInput, formatDateTime, quantity, toIsoTimestamp } from "../components/ui";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { useHealth } from "../providers/health-provider";

export function SleepScreen() {
  const { service, context } = useHealth();
  const action = useHealthAction();
  const load = useCallback(async () => (await service.listSleepRecords(context)).items, [service, context]);
  const query = useHealthQuery(load);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const duration = String(form.get("duration") ?? "");
    const quality = String(form.get("quality") ?? "");
    void action.execute(() => service.recordSleep(context, {
      startedAt: toIsoTimestamp(String(form.get("startedAt"))),
      endedAt: toIsoTimestamp(String(form.get("endedAt"))),
      ...(duration ? { duration: { value: duration, unit: "minute" as const } } : {}),
      ...(quality ? { quality: quality as "poor" | "fair" | "good" | "excellent" } : {}),
    })).then((result) => { if (result) element.reset(); });
  };

  return <>
    <PageHeader eyebrow="Rest log" title="Sleep" description="Record sleep timing, duration, and an optional personal quality rating without interpretation or medical guidance." />
    <div className="grid grid-2">
      <Panel title="Record sleep">
        <ErrorBanner error={action.error} />
        <form className="form-grid" onSubmit={submit}>
          <TextInput label="Started at *" name="startedAt" type="datetime-local" required />
          <TextInput label="Ended at *" name="endedAt" type="datetime-local" required />
          <TextInput label="Duration in minutes" name="duration" inputMode="decimal" />
          <SelectInput label="Quality" name="quality"><option value="">Not rated</option>{["poor", "fair", "good", "excellent"].map((value) => <option key={value}>{value}</option>)}</SelectInput>
          <div className="form-actions"><SubmitButton pending={action.pending}>Record sleep</SubmitButton></div>
        </form>
      </Panel>
      <Panel title="Sleep history">
        <ErrorBanner error={query.error} />
        {query.loading ? <LoadingState /> : !query.data?.length ? <EmptyState title="No sleep records" description="Add a sleep record to start a private history in this preview." /> : <ul className="record-list">{query.data.map((item) => <li className="record-card" key={item.id}><div><h3>{item.quality ?? "Unrated sleep"}</h3><p>{formatDateTime(item.startedAt)} to {formatDateTime(item.endedAt)}</p><p>{quantity(item.duration)}</p></div><button className="button button-small button-danger" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.deleteSleep(context, item.id))}>Delete</button></li>)}</ul>}
      </Panel>
    </div>
  </>;
}
