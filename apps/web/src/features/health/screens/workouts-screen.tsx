"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import type { Exercise, ExerciseSet, WorkoutPlan, WorkoutSession } from "@aperture/health";
import { useHealth } from "../providers/health-provider";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, SelectInput, StatusBadge, SubmitButton, TextInput, formatDateTime, quantity, toIsoTimestamp } from "../components/ui";

interface WorkoutData {
  readonly exercises: readonly Exercise[];
  readonly plans: readonly WorkoutPlan[];
  readonly workouts: readonly WorkoutSession[];
  readonly sets: readonly ExerciseSet[];
}

export function WorkoutsScreen() {
  const { service, context, clock } = useHealth();
  const action = useHealthAction();
  const [statusFilter, setStatusFilter] = useState("");
  const load = useCallback(async (): Promise<WorkoutData> => {
    const [exercisePage, planPage, workoutPage] = await Promise.all([
      service.listExercises(context), service.listWorkoutPlans(context), service.listWorkoutSessions(context),
    ]);
    const setPages = await Promise.all(workoutPage.items.map((workout) => service.listExerciseSetsByWorkout(context, { workoutSessionId: workout.id })));
    return { exercises: exercisePage.items, plans: planPage.items, workouts: workoutPage.items, sets: setPages.flatMap((page) => page.items) };
  }, [service, context]);
  const query = useHealthQuery(load);
  const visibleWorkouts = useMemo(() => (query.data?.workouts ?? []).filter((item) => !statusFilter || item.status === statusFilter), [query.data, statusFilter]);
  const exerciseName = (id: string) => query.data?.exercises.find((item) => item.id === id)?.name ?? "Unknown exercise";

  const submitExercise = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element);
    void action.execute(() => service.createExercise(context, { name: String(form.get("exerciseName")), category: String(form.get("exerciseCategory")) as "strength" | "cardio" | "mobility" | "balance" | "other" })).then((result) => { if (result) element.reset(); });
  };
  const submitPlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); const startsOn = String(form.get("planStarts") ?? "");
    void action.execute(() => service.createWorkoutPlan(context, { title: String(form.get("planTitle")), ...(startsOn ? { startsOn } : {}) })).then((result) => { if (result) element.reset(); });
  };
  const submitWorkout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); const workoutPlanId = String(form.get("workoutPlanId") ?? ""); const scheduledAt = String(form.get("workoutScheduled") ?? "");
    void action.execute(() => service.createWorkoutSession(context, { title: String(form.get("workoutTitle")), ...(workoutPlanId ? { workoutPlanId } : {}), ...(scheduledAt ? { scheduledAt: toIsoTimestamp(scheduledAt) } : {}) })).then((result) => { if (result) element.reset(); });
  };
  const submitSet = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); const repetitions = String(form.get("setRepetitions") ?? ""); const weight = String(form.get("setWeight") ?? "");
    void action.execute(() => service.recordExerciseSet(context, {
      workoutSessionId: String(form.get("setWorkoutId")), exerciseId: String(form.get("setExerciseId")), sequence: Number(form.get("setSequence")),
      ...(repetitions ? { repetitions: { value: Number(repetitions), unit: "repetition" as const } } : {}),
      ...(weight ? { weight: { value: weight, unit: "kilogram" as const } } : {}),
    })).then((result) => { if (result) element.reset(); });
  };

  return <>
    <PageHeader eyebrow="Training log" title="Workouts" description="Create exercises and plans, move sessions through explicit lifecycle states, and record sets without training prescriptions." />
    <ErrorBanner error={query.error ?? action.error} />
    <div className="grid grid-2">
      <Panel title="Exercise catalog"><form className="form-grid" onSubmit={submitExercise}><TextInput label="Exercise name *" name="exerciseName" required /><SelectInput label="Category *" name="exerciseCategory">{["strength", "cardio", "mobility", "balance", "other"].map((value) => <option key={value} value={value}>{value}</option>)}</SelectInput><div className="form-actions"><SubmitButton pending={action.pending}>Create exercise</SubmitButton></div></form>
        {query.data?.exercises.length ? <ul className="record-list health-record-gap">{query.data.exercises.map((item) => <li className="record-card" key={item.id}><div><h3>{item.name}</h3><p>{item.category}</p></div><div className="record-actions"><StatusBadge value={item.status} />{item.status === "active" && <button className="button button-small button-secondary" disabled={action.pending} onClick={() => void action.execute(() => service.archiveExercise(context, item.id))}>Archive</button>}</div></li>)}</ul> : null}
      </Panel>
      <Panel title="Workout plans"><form className="form-grid" onSubmit={submitPlan}><TextInput label="Plan title *" name="planTitle" required /><TextInput label="Starts on" name="planStarts" type="date" /><div className="form-actions"><SubmitButton pending={action.pending}>Create plan</SubmitButton></div></form>
        {query.data?.plans.length ? <ul className="record-list health-record-gap">{query.data.plans.map((item) => <li className="record-card" key={item.id}><div><h3>{item.title}</h3><p>{item.startsOn ?? "No start date"}</p></div><div className="record-actions"><StatusBadge value={item.status} />{item.status === "draft" && <button className="button button-small button-secondary" disabled={action.pending} onClick={() => void action.execute(() => service.activateWorkoutPlan(context, item.id))}>Activate</button>}{item.status !== "archived" && <button className="button button-small button-secondary" disabled={action.pending} onClick={() => void action.execute(() => service.archiveWorkoutPlan(context, item.id))}>Archive</button>}</div></li>)}</ul> : null}
      </Panel>
      <Panel title="Schedule workout"><form className="form-grid" onSubmit={submitWorkout}><TextInput label="Workout title *" name="workoutTitle" required /><SelectInput label="Plan" name="workoutPlanId"><option value="">No plan</option>{query.data?.plans.filter((item) => item.status !== "archived").map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectInput><TextInput className="field-full" label="Scheduled time" name="workoutScheduled" type="datetime-local" /><div className="form-actions"><SubmitButton pending={action.pending}>Create workout</SubmitButton></div></form></Panel>
      <Panel title="Record set" description="A workout and exercise must belong to the authenticated owner."><form className="form-grid" onSubmit={submitSet}><SelectInput label="Workout *" name="setWorkoutId" required><option value="">Choose workout</option>{query.data?.workouts.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectInput><SelectInput label="Exercise *" name="setExerciseId" required><option value="">Choose exercise</option>{query.data?.exercises.filter((item) => item.status === "active").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput><TextInput label="Set number *" name="setSequence" type="number" min="0" required /><TextInput label="Repetitions" name="setRepetitions" type="number" min="0" /><TextInput label="Weight in kg" name="setWeight" inputMode="decimal" /><div className="form-actions"><SubmitButton pending={action.pending}>Record set</SubmitButton></div></form></Panel>
    </div>
    <Panel title="Workout sessions" description="Filter by lifecycle state and use only the transitions exposed by the service.">
      <SelectInput label="Filter by status" name="workoutStatusFilter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{["planned", "in_progress", "paused", "completed", "cancelled"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</SelectInput>
      {query.loading ? <LoadingState /> : visibleWorkouts.length === 0 ? <EmptyState title="No workouts found" description="Create a workout or change the status filter." /> : <ul className="record-list health-record-gap">{visibleWorkouts.map((item) => <li className="record-card" key={item.id}><div><h3>{item.title}</h3><p>{formatDateTime(item.scheduledAt)} · {query.data?.sets.filter((set) => set.workoutSessionId === item.id).length ?? 0} sets</p>{query.data?.sets.filter((set) => set.workoutSessionId === item.id).map((set) => <p key={set.id}>{exerciseName(set.exerciseId)} · {quantity(set.weight)} · {set.repetitions?.value ?? 0} reps <button className="text-button" type="button" onClick={() => void action.execute(() => service.deleteExerciseSet(context, set.id))}>Remove set</button></p>)}</div><div className="record-actions"><StatusBadge value={item.status} />{item.status === "planned" && <button className="button button-small button-secondary" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.startWorkout(context, item.id, clock.now()))}>Start</button>}{item.status === "in_progress" && <button className="button button-small button-secondary" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.pauseWorkout(context, item.id, clock.now()))}>Pause</button>}{item.status === "paused" && <button className="button button-small button-secondary" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.resumeWorkout(context, item.id, clock.now()))}>Resume</button>}{(item.status === "in_progress" || item.status === "paused") && <button className="button button-small button-secondary" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.completeWorkout(context, item.id, clock.now()))}>Complete</button>}{item.status !== "completed" && item.status !== "cancelled" && <button className="button button-small button-danger" type="button" disabled={action.pending} onClick={() => void action.execute(() => service.cancelWorkout(context, item.id))}>Cancel</button>}</div></li>)}</ul>}
    </Panel>
  </>;
}
