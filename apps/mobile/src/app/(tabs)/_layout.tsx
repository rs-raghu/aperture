import { Stack } from "expo-router";
import { MobileDashboardErrorBoundary, MobileDashboardShell } from "../../components/dashboard-shell";
import { MobileDataProvider } from "../../lib/data/mobile-data-provider";

export default function TabsLayout() {
  return <MobileDashboardErrorBoundary><MobileDataProvider><MobileDashboardShell><Stack screenOptions={{ headerShown: false }} /></MobileDashboardShell></MobileDataProvider></MobileDashboardErrorBoundary>;
}
