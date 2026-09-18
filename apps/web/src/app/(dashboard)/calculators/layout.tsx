import type { ReactNode } from "react";
import { FinanceShell } from "@/features/finance";

export default function CalculatorsLayout({ children }: { readonly children: ReactNode }) {
  return <FinanceShell calculatorMode>{children}</FinanceShell>;
}
