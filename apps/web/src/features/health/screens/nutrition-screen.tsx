"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import type { MealType } from "@aperture/health";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, SelectInput, SubmitButton, TextInput, formatDateTime, quantity, toIsoTimestamp } from "../components/ui";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { useHealth } from "../providers/health-provider";

const mealTypes: readonly MealType[] = ["breakfast", "lunch", "dinner", "snack", "other"];

export function NutritionScreen() {
  const { service, context } = useHealth();
  const action = useHealthAction();
  const [mealFilter, setMealFilter] = useState("");
  const load = useCallback(async () => (await service.listNutritionEntries(context)).items, [service, context]);
  const query = useHealthQuery(load);
  const visible = useMemo(() => (query.data ?? []).filter((item) => !mealFilter || item.mealType === mealFilter), [query.data, mealFilter]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const energy = String(form.get("energy") ?? "");
    void action.execute(() => service.createNutritionEntry(context, {
      title: String(form.get("title")),
      mealType: String(form.get("mealType")) as MealType,
      consumedAt: toIsoTimestamp(String(form.get("consumedAt"))),
      ...(energy ? { energy: { value: energy, unit: "kilocalorie" as const } } : {}),
    })).then((result) => { if (result) element.reset(); });
  };

  return <>
    <PageHeader eyebrow="Food log" title="Nutrition" description="Keep factual meal and energy records. Aperture does not score food choices or recommend a diet." />
    <div className="grid grid-2">
      <Panel title="Add nutrition entry">
        <ErrorBanner error={action.error} />
        <form className="form-grid" onSubmit={submit}>
          <TextInput label="Entry title *" name="title" required />
          <SelectInput label="Meal type *" name="mealType">{mealTypes.map((type) => <option value={type} key={type}>{type}</option>)}</SelectInput>
          <TextInput label="Consumed at *" name="consumedAt" type="datetime-local" required />
          <TextInput label="Energy in kcal" name="energy" inputMode="decimal" />
          <div className="form-actions"><SubmitButton pending={action.pending}>Add entry</SubmitButton></div>
        </form>
      </Panel>
      <Panel title="Nutrition history">
        <SelectInput label="Filter by meal" name="mealFilter" value={mealFilter} onChange={(event) => setMealFilter(event.target.value)}><option value="">All meals</option>{mealTypes.map((type) => <option value={type} key={type}>{type}</option>)}</SelectInput>
        <ErrorBanner error={query.error} />
        {query.loading ? <LoadingState /> : visible.length === 0 ? <EmptyState title="No nutrition entries found" description="Add an entry or change the meal filter." /> : <ul className="record-list health-record-gap">{visible.map((item) => <li className="record-card" key={item.id}><div><h3>{item.title}</h3><p>{item.mealType} · {formatDateTime(item.consumedAt)}</p><p>{quantity(item.energy)}</p></div><button className="button button-small button-danger" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.deleteNutritionEntry(context, item.id))}>Delete</button></li>)}</ul>}
      </Panel>
    </div>
  </>;
}
