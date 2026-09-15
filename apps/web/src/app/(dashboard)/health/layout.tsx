import type { ReactNode } from "react";
import { HealthProvider, HealthShell } from "@/features/health";

export default function HealthLayout({ children }: { readonly children: ReactNode }) {
  return <HealthProvider><HealthShell>{children}</HealthShell></HealthProvider>;
}
