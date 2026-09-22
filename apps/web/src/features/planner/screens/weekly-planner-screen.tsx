"use client";

import type { WeeklyPlan } from "@aperture/planner";
import { useEffect, useState } from "react";
import { usePlanner } from "../providers/planner-provider";

export function WeeklyPlannerScreen() {
  const { service, context, clock, revision } = usePlanner();
  const [date, setDate] = useState(() => clock.now().slice(0, 10));
  const [week, setWeek] = useState<WeeklyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const request = { context, date, revision };
    void service.getWeeklyPlan(request.context, request.date).then((value) => { if (active) { setWeek(value); setError(null); } }).catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Unable to load the week."); });
    return () => { active = false; };
  }, [context, date, revision, service]);
  return <><header className="page-header"><div><p className="eyebrow">Weekly planner</p><h1>See the whole week</h1><p>Recurring items appear on every matching date and overdue work remains visible in each day’s decision queue.</p></div></header>
    {error && <div className="error-banner" role="alert">{error}</div>}
    <div className="filters"><div className="field"><label htmlFor="week-date">Week containing</label><input id="week-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div></div>
    {!week ? <div className="loading-state" role="status">Loading week…</div> : <section className="week-grid" aria-label={`${week.startsOn} through ${week.endsOn}`}>{week.days.map((day) => <article className="panel week-day" key={day.date}><div className="panel-heading"><h2>{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${day.date}T00:00:00Z`))}</h2><p>{day.scheduled.length} open · {day.completed.length} done</p></div>{day.scheduled.length === 0 ? <p className="muted-copy">No scheduled items.</p> : <ul className="hierarchy">{day.scheduled.map(({ item }) => <li key={item.id}><strong>{item.title}</strong><br /><span className="muted-copy">{item.itemType} · priority {item.priority}</span></li>)}</ul>}{day.overdue.length > 0 && <p className="overdue">{day.overdue.length} overdue</p>}</article>)}</section>}
  </>;
}
