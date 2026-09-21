import { Stack } from "expo-router";
import { MobileDataProvider } from "../../lib/data/mobile-data-provider";

export default function TabsLayout() {
  return <MobileDataProvider><Stack screenOptions={{ headerShown: false }} /></MobileDataProvider>;
}
