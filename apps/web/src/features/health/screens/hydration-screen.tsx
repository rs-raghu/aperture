"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, SubmitButton, TextInput, formatDateTime, quantity, toIsoTimestamp } from "../components/ui";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { useHealth } from "../providers/health-provider";

const SUMMARY_RANGE = { startsAt: "2000-01-01T00:00:00Z", endsAt: "2100-12-31T23:59:59Z" } as const;

export function HydrationScreen() {
  const { service, context } = useHealth();
  const action = useHealthAction();
  const [dateFilter, setDateFilter] = useState("");
  const load = useCallback(async () => {
    const [entries, summary] = await Promise.all([
      service.listHydrationEntries(context),
      service.getHydrationSummary({ ownerId: context.ownerId, range: SUMMARY_RANGE }),
    ]);
    return { entries: entries.items, summary };
  }, [service, context]);
  const query = useHealthQuery(load);
  const visible = useMemo(() => (query.data?.entries ?? []).filter((item) => !dateFilter || item.consumedAt.slice(0, 10) === dateFilter), [query.data, dateFilter]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    void action.execute(() => service.recordHydration(context, {
      volume: { value: String(form.get("volume")), unit: "milliliter" },
      consumedAt: toIsoTimestamp(String(form.get("consumedAt"))),
    })).then((result) => { if (result) element.reset(); });
  };

  return <>
    <PageHeader eyebrow="Fluid log" title="Hydration" description="Track consumed volumes and factual totals. The preview does not calculate a recommended intake." />
    <div className="grid grid-2">
      <Panel title="Record hydration">
        <ErrorBanner error={action.error} />
        <form className="form-grid" onSubmit={submit}>
          <TextInput label="Volume in milliliters *" name="volume" inputMode="decimal" required />
          <TextInput label="Consumed at *" name="consumedAt" type="datetime-local" required />
          <div className="form-actions"><SubmitButton pending={action.pending}>Record hydration</SubmitButton></div>
        </form>
      </Panel>
      <Panel title="Hydration history" description={`${quantity(query.data?.summary.totalVolume)} across all stored records.`}>
        <TextInput label="Filter by date" name="hydrationDate" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        <ErrorBanner error={query.error} />
        {query.loading ? <LoadingState /> : visible.length === 0 ? <EmptyState title="No hydration entries found" description="Record a drink or change the date filter." /> : <ul className="record-list health-record-gap">{visible.map((item) => <li className="record-card" key={item.id}><div><h3>{quantity(item.volume)}</h3><p>{formatDateTime(item.consumedAt)}</p></div><button className="button button-small button-danger" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.deleteHydrationEntry(context, item.id))}>Delete</button></li>)}</ul>}
      </Panel>
    </div>
  </>;
}
