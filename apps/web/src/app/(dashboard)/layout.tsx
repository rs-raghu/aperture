import type { ReactNode } from "react";
import { FinanceProvider } from "@/features/finance";

export default function DashboardLayout({ children }: { readonly children: ReactNode }) {
  return <FinanceProvider>{children}</FinanceProvider>;
}
