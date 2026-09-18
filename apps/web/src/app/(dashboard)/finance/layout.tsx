import type { ReactNode } from "react";
import { FinanceShell } from "@/features/finance";

export default function FinanceLayout({ children }: { readonly children: ReactNode }) {
  return <FinanceShell>{children}</FinanceShell>;
}
