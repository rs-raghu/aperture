"use client";

import type { DailyPlan, PlannerItem, PlannerItemStatus, PlannerItemType } from "@aperture/planner";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { usePlanner } from "../providers/planner-provider";

function dateToday(now: string): string { return now.slice(0, 10); }
function toInstant(value: string): string | undefined { return value ? new Date(value).toISOString() : undefined; }
function pretty(value?: string): string { return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "No time set"; }

export function PlannerScreen() {
  const { service, context, clock, revision, refresh } = usePlanner();
  const [date, setDate] = useState(() => dateToday(clock.now()));
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState<PlannerItemType>("task");
  const [priority, setPriority] = useState("2");
  const [dueAt, setDueAt] = useState("");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [statusFilter, setStatusFilter] = useState<"all" | PlannerItemStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | PlannerItemType>("all");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    const request = { context, date, revision };
    void service.getDailyPlan(request.context, request.date).then((value) => {
      if (active) { setPlan(value); setError(null); }
    }).catch((caught: unknown) => {
      if (active) setError(caught instanceof Error ? caught.message : "Unable to load the plan.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [context, date, revision, service]);

  const visible = useMemo(() => {
    const byId = new Map<string, { item: PlannerItem; overdue: boolean }>();
    for (const entry of [...(plan?.overdue ?? []), ...(plan?.scheduled ?? []), ...(plan?.completed ?? [])]) byId.set(entry.item.id, entry);
    return [...byId.values()].filter(({ item }) => (statusFilter === "all" || item.status === statusFilter) && (typeFilter === "all" || item.itemType === typeFilter));
  }, [plan, statusFilter, typeFilter]);

  async function mutate(action: () => Promise<unknown>) {
    setPending(true);
    try { await action(); setError(null); refresh(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to update the plan."); }
    finally { setPending(false); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) { setError("Enter a task or event title."); return; }
    void mutate(async () => {
      const deadline = toInstant(dueAt);
      await service.createItem(context, {
        title: title.trim(), itemType, priority: Number(priority), scheduledFor: date,
        ...(deadline === undefined ? {} : { dueAt: deadline }),
        ...(recurrence === "none" ? {} : { recurrence: { frequency: recurrence, interval: 1 } }),
      });
      setTitle(""); setDueAt(""); setRecurrence("none");
    });
  }

  return <>
    <header className="page-header"><div><p className="eyebrow">Daily planner</p><h1>Shape the day before it shapes you</h1><p>Schedule tasks, events, reminders, and focus blocks. Recurring work is expanded into each matching day, while missed deadlines stay visible.</p></div></header>
    {error && <div className="error-banner" role="alert">{error}</div>}
    <section className="grid grid-3 metric-grid" aria-label="Daily summary">
      <article className="metric"><span className="metric-label">Scheduled</span><strong className="metric-value">{plan?.scheduled.length ?? 0}</strong><span className="metric-detail">Open on {date}</span></article>
      <article className="metric"><span className="metric-label">Overdue</span><strong className="metric-value">{plan?.overdue.length ?? 0}</strong><span className="metric-detail">Needs a new decision</span></article>
      <article className="metric"><span className="metric-label">Completed</span><strong className="metric-value">{plan?.completed.length ?? 0}</strong><span className="metric-detail">Finished today</span></article>
    </section>
    <div className="grid grid-2 planner-layout">
      <section className="panel"><div className="panel-heading"><h2>Add to the plan</h2><p>Create owner-scoped work with an optional deadline and recurrence rule.</p></div>
        <form className="form-grid" onSubmit={submit}>
          <div className="field field-full"><label htmlFor="planner-title">Title</label><input id="planner-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required /></div>
          <div className="field"><label htmlFor="planner-type">Type</label><select id="planner-type" value={itemType} onChange={(event) => setItemType(event.target.value as PlannerItemType)}><option value="task">Task</option><option value="event">Event</option><option value="reminder">Reminder</option><option value="focus">Focus block</option></select></div>
          <div className="field"><label htmlFor="planner-priority">Priority</label><select id="planner-priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="0">None</option><option value="1">Low</option><option value="2">Normal</option><option value="3">High</option><option value="4">Urgent</option></select></div>
          <div className="field"><label htmlFor="planner-date">Scheduled date</label><input id="planner-date" type="date" value={date} onChange={(event) => { setLoading(true); setDate(event.target.value); }} required /></div>
          <div className="field"><label htmlFor="planner-due">Deadline</label><input id="planner-due" type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></div>
          <div className="field field-full"><label htmlFor="planner-recurrence">Repeat</label><select id="planner-recurrence" value={recurrence} onChange={(event) => setRecurrence(event.target.value as typeof recurrence)}><option value="none">Does not repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
          <div className="form-actions"><button className="button button-primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Add item"}</button></div>
        </form>
      </section>
      <section className="panel"><div className="panel-heading"><h2>{dateToday(clock.now()) === date ? "Today" : date}</h2><p>Filter this day without hiding overdue work from the summary.</p></div>
        <div className="filters"><div className="field"><label htmlFor="planner-status">Status</label><select id="planner-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option value="all">All statuses</option><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></div><div className="field"><label htmlFor="planner-filter-type">Type</label><select id="planner-filter-type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}><option value="all">All types</option><option value="task">Tasks</option><option value="event">Events</option><option value="reminder">Reminders</option><option value="focus">Focus blocks</option></select></div></div>
        {loading ? <div className="loading-state" role="status">Loading planner…</div> : visible.length === 0 ? <div className="empty-state"><h3>Nothing planned</h3><p>Add an item or choose another date.</p></div> : <ul className="record-list">{visible.map(({ item, overdue }) => <li className="record-card" key={item.id}><div><h3>{item.title}</h3><p><span className="status-badge">{item.itemType}</span> · Priority {item.priority}</p><p className={overdue ? "overdue" : undefined}>{overdue ? "Overdue · " : ""}{pretty(item.startsAt ?? item.dueAt)}</p>{item.recurrence && <p>Repeats {item.recurrence.frequency}</p>}</div><div className="record-actions">{item.status === "completed" ? <button className="button button-secondary button-small" disabled={pending} onClick={() => void mutate(() => service.reopenItem(context, item.id))}>Reopen</button> : <button className="button button-primary button-small" disabled={pending} onClick={() => void mutate(() => service.completeItem(context, item.id))}>Complete</button>}<button className="button button-danger button-small" disabled={pending} onClick={() => void mutate(() => service.deleteItem(context, item.id))}>Delete</button></div></li>)}</ul>}
      </section>
    </div>
  </>;
}
