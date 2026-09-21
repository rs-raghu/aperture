import { Stack } from "expo-router";

export default function CalculatorsLayout() {
  return <Stack screenOptions={{ headerStyle: { backgroundColor: "#281a3a" }, headerTintColor: "#ffffff", headerTitleStyle: { fontWeight: "700" }, contentStyle: { backgroundColor: "#f8f5fc" } }}><Stack.Screen name="index" options={{ title: "Calculator Hub" }} /><Stack.Screen name="[calculator-id]" options={{ title: "Calculator" }} /></Stack>;
}
