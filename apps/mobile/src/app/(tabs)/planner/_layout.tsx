import { Stack } from "expo-router";
export default function PlannerLayout() { return <Stack screenOptions={{ headerStyle: { backgroundColor: "#253a58" }, headerTintColor: "#fff", contentStyle: { backgroundColor: "#f6f7f4" } }}><Stack.Screen name="index" options={{ title: "Planner" }} /><Stack.Screen name="week" options={{ title: "Week" }} /></Stack>; }
