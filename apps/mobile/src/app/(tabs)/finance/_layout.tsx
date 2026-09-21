import { Stack } from "expo-router";

export default function FinanceLayout() {
  return <Stack screenOptions={{ headerStyle: { backgroundColor: "#281a3a" }, headerTintColor: "#ffffff", headerTitleStyle: { fontWeight: "700" }, contentStyle: { backgroundColor: "#f8f5fc" } }}><Stack.Screen name="index" options={{ title: "Finance" }} /><Stack.Screen name="accounts" options={{ title: "Accounts" }} /><Stack.Screen name="transactions" options={{ title: "Transactions" }} /><Stack.Screen name="budgets" options={{ title: "Budgets" }} /><Stack.Screen name="assets" options={{ title: "Assets" }} /><Stack.Screen name="liabilities" options={{ title: "Liabilities" }} /><Stack.Screen name="investments" options={{ title: "Investments" }} /><Stack.Screen name="loans" options={{ title: "Loans" }} /><Stack.Screen name="goals" options={{ title: "Goals" }} /></Stack>;
}
