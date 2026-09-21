import type { ReactNode } from "react";
import { HealthShell } from "@/features/health";

export default function HealthLayout({ children }: { readonly children: ReactNode }) {
  return <HealthShell>{children}</HealthShell>;
}
