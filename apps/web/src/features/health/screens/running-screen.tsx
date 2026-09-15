"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import type { ActivityRoute, Equipment, RunningActivity, WorkoutSession } from "@aperture/health";
import { useHealth } from "../providers/health-provider";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, SelectInput, StatusBadge, SubmitButton, TextInput, formatDateTime, quantity, toIsoTimestamp } from "../components/ui";

interface RunningData {
  readonly routes: readonly ActivityRoute[];
  readonly equipment: readonly Equipment[];
  readonly workouts: readonly WorkoutSession[];
  readonly activities: readonly RunningActivity[];
}

export function RunningScreen() {
  const { service, context, clock } = useHealth();
  const action = useHealthAction();
  const [statusFilter, setStatusFilter] = useState("");
  const load = useCallback(async (): Promise<RunningData> => {
    const [routes, equipment, workouts, activities] = await Promise.all([
      service.listActivityRoutes(context), service.listEquipment(context), service.listWorkoutSessions(context), service.listRunningActivities(context),
    ]);
    return { routes: routes.items, equipment: equipment.items, workouts: workouts.items, activities: activities.items };
  }, [service, context]);
  const query = useHealthQuery(load);
  const visible = useMemo(() => (query.data?.activities ?? []).filter((item) => !statusFilter || item.status === statusFilter), [query.data, statusFilter]);

  const submitRoute = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); const distance = String(form.get("routeDistance") ?? "");
    void action.execute(() => service.createActivityRoute(context, { title: String(form.get("routeTitle")), ...(distance ? { distance: { value: distance, unit: "kilometer" as const } } : {}) })).then((result) => { if (result) element.reset(); });
  };
  const submitEquipment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element);
    void action.execute(() => service.createEquipment(context, { name: String(form.get("equipmentName")), category: String(form.get("equipmentCategory")) as "running_shoes" | "strength" | "cardio" | "mobility" | "other" })).then((result) => { if (result) element.reset(); });
  };
  const submitActivity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); const routeId = String(form.get("runningRouteId") ?? ""); const equipmentId = String(form.get("runningEquipmentId") ?? ""); const workoutSessionId = String(form.get("runningWorkoutId") ?? "");
    void action.execute(() => service.createRunningActivity(context, {
      title: String(form.get("runningTitle")), startedAt: toIsoTimestamp(String(form.get("runningStartedAt"))),
      ...(routeId ? { routeId } : {}), ...(equipmentId ? { equipmentIds: [equipmentId] } : {}), ...(workoutSessionId ? { workoutSessionId } : {}),
    })).then((result) => { if (result) element.reset(); });
  };
  const submitResult = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element);
    void action.execute(() => service.updateRunningActivity(context, String(form.get("resultActivityId")), {
      distance: { value: String(form.get("resultDistance")), unit: "kilometer" },
      duration: { value: String(form.get("resultDuration")), unit: "minute" },
    })).then((result) => { if (result) element.reset(); });
  };
  const submitUsage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); const runningActivityId = String(form.get("usageActivityId") ?? "");
    void action.execute(() => service.recordEquipmentUsage(context, {
      equipmentId: String(form.get("usageEquipmentId")), ...(runningActivityId ? { runningActivityId } : {}),
      distance: { value: String(form.get("usageDistance")), unit: "kilometer" }, duration: { value: String(form.get("usageDuration")), unit: "minute" },
    })).then((result) => { if (result) element.reset(); });
  };

  return <>
    <PageHeader eyebrow="Activity log" title="Running" description="Manage routes, equipment, runs, results, and usage records. The preview reports arithmetic totals without coaching or medical guidance." />
    <ErrorBanner error={query.error ?? action.error} />
    <div className="grid grid-2">
      <Panel title="Routes"><form className="form-grid" onSubmit={submitRoute}><TextInput label="Route title *" name="routeTitle" required /><TextInput label="Distance in km" name="routeDistance" inputMode="decimal" /><div className="form-actions"><SubmitButton pending={action.pending}>Create route</SubmitButton></div></form>{query.data?.routes.length ? <ul className="record-list health-record-gap">{query.data.routes.map((item) => <li className="record-card" key={item.id}><div><h3>{item.title}</h3><p>{quantity(item.distance)}</p></div><button className="button button-small button-danger" onClick={() => void action.execute(() => service.deleteActivityRoute(context, item.id))}>Delete</button></li>)}</ul> : null}</Panel>
      <Panel title="Equipment"><form className="form-grid" onSubmit={submitEquipment}><TextInput label="Equipment name *" name="equipmentName" required /><SelectInput label="Category *" name="equipmentCategory">{["running_shoes", "cardio", "strength", "mobility", "other"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</SelectInput><div className="form-actions"><SubmitButton pending={action.pending}>Create equipment</SubmitButton></div></form>{query.data?.equipment.length ? <ul className="record-list health-record-gap">{query.data.equipment.map((item) => <li className="record-card" key={item.id}><div><h3>{item.name}</h3><p>{item.category.replaceAll("_", " ")}</p></div><div className="record-actions"><StatusBadge value={item.status} />{item.status === "active" && <button className="button button-small button-secondary" onClick={() => void action.execute(() => service.retireEquipment(context, item.id))}>Retire</button>}</div></li>)}</ul> : null}</Panel>
      <Panel title="Create running activity"><form className="form-grid" onSubmit={submitActivity}><TextInput label="Run title *" name="runningTitle" required /><TextInput label="Started at *" name="runningStartedAt" type="datetime-local" required /><SelectInput label="Route" name="runningRouteId"><option value="">No route</option>{query.data?.routes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectInput><SelectInput label="Equipment" name="runningEquipmentId"><option value="">No equipment</option>{query.data?.equipment.filter((item) => item.status === "active").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput><SelectInput label="Workout" name="runningWorkoutId"><option value="">No workout</option>{query.data?.workouts.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectInput><div className="form-actions"><SubmitButton pending={action.pending}>Create run</SubmitButton></div></form></Panel>
      <Panel title="Save running result"><form className="form-grid" onSubmit={submitResult}><SelectInput label="Activity *" name="resultActivityId" required><option value="">Choose activity</option>{query.data?.activities.filter((item) => item.status !== "completed").map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectInput><TextInput label="Distance in km *" name="resultDistance" inputMode="decimal" required /><TextInput label="Duration in minutes *" name="resultDuration" inputMode="decimal" required /><div className="form-actions"><SubmitButton pending={action.pending}>Save result</SubmitButton></div></form></Panel>
      <Panel title="Record equipment usage"><form className="form-grid" onSubmit={submitUsage}><SelectInput label="Used equipment *" name="usageEquipmentId" required><option value="">Choose equipment</option>{query.data?.equipment.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput><SelectInput label="Linked activity" name="usageActivityId"><option value="">No activity</option>{query.data?.activities.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectInput><TextInput label="Usage distance in km *" name="usageDistance" inputMode="decimal" required /><TextInput label="Usage duration in minutes *" name="usageDuration" inputMode="decimal" required /><div className="form-actions"><SubmitButton pending={action.pending}>Record usage</SubmitButton></div></form></Panel>
    </div>
    <Panel title="Running activities"><SelectInput label="Filter by status" name="runningStatusFilter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{["planned", "in_progress", "completed"].map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</SelectInput>{query.loading ? <LoadingState /> : visible.length === 0 ? <EmptyState title="No running activities found" description="Create a run or change the status filter." /> : <ul className="record-list health-record-gap">{visible.map((item) => <li className="record-card" key={item.id}><div><h3>{item.title}</h3><p>{formatDateTime(item.startedAt)} · {quantity(item.distance)} · {quantity(item.duration)}</p></div><div className="record-actions"><StatusBadge value={item.status} />{item.status !== "completed" && <button className="button button-small button-secondary" onClick={() => void action.execute(() => service.completeRunningActivity(context, item.id, clock.now()))}>Complete</button>}<button className="button button-small button-danger" onClick={() => void action.execute(() => service.deleteRunningActivity(context, item.id))}>Delete</button></div></li>)}</ul>}</Panel>
  </>;
}
