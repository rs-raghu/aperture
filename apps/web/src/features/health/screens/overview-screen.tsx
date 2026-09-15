"use client";

import { useCallback } from "react";
import type { Appointment, HealthMeasurement, HealthOverview, HealthProfile } from "@aperture/health";
import { useHealth } from "../providers/health-provider";
import { useHealthQuery } from "../hooks/use-health-query";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, formatDateTime, quantity } from "../components/ui";

interface OverviewData {
  readonly profile: HealthProfile | null;
  readonly overview: HealthOverview;
  readonly latest: readonly HealthMeasurement[];
  readonly appointments: readonly Appointment[];
}

export function OverviewScreen() {
  const { service, context } = useHealth();
  const load = useCallback(async (): Promise<OverviewData> => {
    const [profile, overview, latest, appointments] = await Promise.all([
      service.getHealthProfile(context),
      service.getHealthOverview(context.ownerId),
      service.getLatestMeasurements(context.ownerId),
      service.getUpcomingAppointments({ ownerId: context.ownerId, limit: 5 }),
    ]);
    return { profile, overview, latest, appointments };
  }, [service, context]);
  const query = useHealthQuery(load);

  return <>
    <PageHeader eyebrow="Personal record" title="Health overview" description="Review the observations and activity you explicitly recorded. This preview provides arithmetic summaries without diagnosis, targets, or medical recommendations." />
    <ErrorBanner error={query.error} />
    {query.loading || query.data === null ? <LoadingState /> : <>
      {!query.data.profile && <div className="health-onboarding" role="note"><strong>Set up your Health profile</strong><span>Choose a measurement system on the Profile page before building your record.</span></div>}
      <div className="grid metric-grid">
        <article className="metric"><span className="metric-label">Measurement types</span><strong className="metric-value">{query.data.overview.latestMeasurementCount}</strong><span className="metric-detail">latest recorded values</span></article>
        <article className="metric"><span className="metric-label">Workout sessions</span><strong className="metric-value">{query.data.overview.recentWorkoutCount}</strong><span className="metric-detail">stored in this preview</span></article>
        <article className="metric"><span className="metric-label">Upcoming appointments</span><strong className="metric-value">{query.data.overview.upcomingAppointmentCount}</strong><span className="metric-detail">scheduled after preview time</span></article>
      </div>
      <div className="grid grid-2">
        <Panel title="Latest measurements" description="One latest observation per measurement type.">
          {query.data.latest.length === 0 ? <EmptyState title="No measurements yet" description="Record weight, height, waist, or hip measurements to populate this panel." /> : <ul className="record-list">{query.data.latest.map((item) => <li className="record-card" key={item.id}><div><h3>{item.type}</h3><p>{quantity(item.measurement)} · {formatDateTime(item.observedAt)}</p></div></li>)}</ul>}
        </Panel>
        <Panel title="Upcoming appointments" description="Scheduled entries based on the injected preview clock.">
          {query.data.appointments.length === 0 ? <EmptyState title="No upcoming appointments" description="Scheduled appointments will appear here after they are recorded through the Health service." /> : <ul className="record-list">{query.data.appointments.map((item) => <li className="record-card" key={item.id}><div><h3>{item.title}</h3><p>{formatDateTime(item.startsAt)}</p></div></li>)}</ul>}
        </Panel>
      </div>
    </>}
  </>;
}
