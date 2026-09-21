import { Stack } from "expo-router";
import { FinanceProvider } from "../../features/finance";

export default function TabsLayout() {
  return <FinanceProvider><Stack screenOptions={{ headerShown: false }} /></FinanceProvider>;
}
