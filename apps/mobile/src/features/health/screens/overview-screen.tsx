import { useCallback } from "react";
import type { HealthMeasurement, HealthOverview, HealthProfile } from "@aperture/health";
import { featureRegistry } from "@aperture/feature-registry";
import { EmptyState, ErrorBanner, LoadingState, Metric, NavigationCard, PageHeader, Panel, PreviewNotice, RecordCard, RecordList, Screen } from "../components/ui";
import { useHealthQuery } from "../hooks/use-health-query";
import { useHealth } from "../providers/health-provider";
import { formatHealthDateTime, formatHealthQuantity } from "../view-models/formatting";

interface OverviewData { readonly profile: HealthProfile | null; readonly overview: HealthOverview; readonly latest: readonly HealthMeasurement[] }
const healthNavigation = featureRegistry.secondaryNavigation("health", "mobile");

export function OverviewScreen() {
  const { service, context } = useHealth();
  const load = useCallback(async (): Promise<OverviewData> => {
    const [profile, overview, latest] = await Promise.all([service.getHealthProfile(context), service.getHealthOverview(context.ownerId), service.getLatestMeasurements(context.ownerId)]);
    return { profile, overview, latest };
  }, [service, context]);
  const query = useHealthQuery(load);
  return <Screen testID="health-overview-screen"><PageHeader title="Health" description="Review observations and activity recorded through the shared Health service." /><PreviewNotice /><ErrorBanner error={query.error} />{query.loading || !query.data ? <LoadingState /> : <><Panel title="At a glance">{!query.data.profile ? <EmptyState title="Health profile not set up" description="Choose a measurement system before building your health record." href="/health/profile" action="Open profile" /> : null}<Metric label="Measurement types" value={String(query.data.overview.latestMeasurementCount)} detail="Latest recorded values" /><Metric label="Workout sessions" value={String(query.data.overview.recentWorkoutCount)} detail="Recorded sessions" /><Metric label="Upcoming appointments" value={String(query.data.overview.upcomingAppointmentCount)} detail="Scheduled after now" /></Panel><Panel title="Latest measurements" description="One latest observation for each recorded type.">{!query.data.latest.length ? <EmptyState title="No measurements" description="Record a body measurement to populate this panel." /> : <RecordList items={query.data.latest} keyExtractor={(item) => item.id} accessibilityLabel="Latest Health measurements" renderItem={(item) => <RecordCard title={item.type} details={[formatHealthQuantity(item.measurement), formatHealthDateTime(item.observedAt)]} />} />}</Panel></>}
    <Panel title="Health tools" description="The provider remains mounted while navigating between these native routes.">{healthNavigation.map((item) => <NavigationCard key={item.id} href={item.path} title={item.label} description={item.description} />)}</Panel>
  </Screen>;
}
