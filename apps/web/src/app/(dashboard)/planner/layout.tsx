import type { ReactNode } from "react";
import { PlannerShell } from "@/features/planner/components/planner-shell";
export default function PlannerLayout({ children }: { readonly children: ReactNode }) { return <PlannerShell>{children}</PlannerShell>; }
