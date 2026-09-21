import { useLocalSearchParams } from "expo-router";
import { CalculatorScreen } from "../../../features/finance";

export default function CalculatorRoute() {
  const parameters = useLocalSearchParams();
  const value = parameters["calculator-id"];
  return <CalculatorScreen calculatorId={Array.isArray(value) ? value[0] ?? "" : value ?? ""} />;
}
