import { Stack } from "expo-router";

export default function HealthLayout() {
  return <Stack screenOptions={{ headerStyle: { backgroundColor: "#12343b" }, headerTintColor: "#ffffff", headerTitleStyle: { fontWeight: "700" }, contentStyle: { backgroundColor: "#f2f8f6" } }}><Stack.Screen name="index" options={{ title: "Health" }} /><Stack.Screen name="profile" options={{ title: "Health profile" }} /><Stack.Screen name="measurements" options={{ title: "Measurements" }} /><Stack.Screen name="vitals" options={{ title: "Vital signs" }} /><Stack.Screen name="workouts" options={{ title: "Workouts" }} /><Stack.Screen name="running" options={{ title: "Running" }} /><Stack.Screen name="sleep" options={{ title: "Sleep" }} /><Stack.Screen name="nutrition" options={{ title: "Nutrition" }} /><Stack.Screen name="hydration" options={{ title: "Hydration" }} /><Stack.Screen name="goals" options={{ title: "Progress" }} /></Stack>;
}
