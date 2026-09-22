"use client";

import { featureRegistry } from "@aperture/feature-registry";
import type { TodayDashboard } from "@aperture/today";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToday } from "./provider";

const definitions = featureRegistry.widgets("web");
function pretty(value?: string): string { return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Any time"; }

export function TodayScreen() {
  const { service, ownerId, now } = useToday();
  const [date, setDate] = useState(() => now().slice(0, 10));
  const [enabled, setEnabled] = useState(() => new Set(definitions.filter(({ defaultEnabled }) => defaultEnabled).map(({ id }) => id)));
  const [dashboard, setDashboard] = useState<TodayDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void service.getDashboard({ ownerId, date, enabledWidgetIds: [...enabled] }).then((value) => { if (active) { setDashboard(value); setError(null); } }).catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Unable to load Today."); });
    return () => { active = false; };
  }, [date, enabled, ownerId, service]);
  const toggle = (id: string) => setEnabled((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <main className="today-main">
    <header className="page-header"><div><p className="eyebrow">Today · {date}</p><h1>One place for what matters now</h1><p>Planner, study, health, and finance contributions are loaded through their manifest registrations.</p></div><div className="field"><label htmlFor="today-date">Dashboard date</label><input id="today-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div></header>
    {error && <div className="error-banner" role="alert">{error}</div>}
    <section className="grid grid-3 metric-grid" aria-label="Today summary"><article className="metric"><span className="metric-label">Items</span><strong className="metric-value">{dashboard?.totalItems ?? 0}</strong><span className="metric-detail">Across enabled widgets</span></article><article className="metric"><span className="metric-label">Overdue</span><strong className="metric-value">{dashboard?.overdueItems ?? 0}</strong><span className="metric-detail">Needs attention</span></article><article className="metric"><span className="metric-label">Widgets</span><strong className="metric-value">{dashboard?.widgets.length ?? enabled.size}</strong><span className="metric-detail">Visible today</span></article></section>
    <section className="panel today-controls"><div className="panel-heading"><h2>Quick actions</h2><p>Jump directly to the feature that owns the record.</p></div><div className="quick-actions">{dashboard?.quickActions.map((action) => <Link className="button button-secondary" href={action.href} key={action.id}>{action.label}</Link>)}</div><fieldset><legend>Visible widgets</legend>{definitions.map((widget) => <label key={widget.id}><input type="checkbox" checked={enabled.has(widget.id)} onChange={() => toggle(widget.id)} /> {widget.title}</label>)}</fieldset></section>
    {!dashboard ? <div className="loading-state" role="status">Loading Today…</div> : <section className="today-widget-grid">{dashboard.widgets.map((widget) => <article className="panel today-widget" key={widget.definition.id}><div className="panel-heading"><p className="eyebrow">{widget.definition.featureName}</p><h2>{widget.definition.title}</h2><p>{widget.definition.description}</p></div>{widget.state === "unavailable" ? <div className="error-banner" role="status">{widget.message}</div> : widget.items.length === 0 ? <div className="empty-state"><h3>Nothing here</h3><p>No matching records for this date.</p></div> : <ul className="record-list">{widget.items.map((item) => <li className="record-card" key={item.id}><div><h3><Link href={item.href}>{item.title}</Link></h3><p className={item.overdue ? "overdue" : undefined}>{item.overdue ? "Overdue · " : ""}{pretty(item.occursAt)}</p>{item.detail && <p>{item.detail}</p>}</div>{item.status && <span className="status-badge">{item.status}</span>}</li>)}</ul>}</article>)}</section>}
  </main>;
}
