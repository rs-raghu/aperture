import { CalculatorScreen } from "@/features/finance";

export default async function CalculatorPage({ params }: { readonly params: Promise<{ readonly "calculator-id": string }> }) {
  const calculatorId = (await params)["calculator-id"];
  return <CalculatorScreen calculatorId={calculatorId} />;
}
