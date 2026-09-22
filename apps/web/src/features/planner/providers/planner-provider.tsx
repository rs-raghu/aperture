"use client";

import type { PlannerClock, PlannerOperationContext, PlannerService } from "@aperture/planner";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export interface PlannerWebRuntime {
  readonly service: PlannerService;
  readonly context: PlannerOperationContext;
  readonly clock: PlannerClock;
}

interface PlannerContextValue extends PlannerWebRuntime { readonly revision: number; readonly refresh: () => void; }
const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ runtime, children }: { readonly runtime: PlannerWebRuntime; readonly children: ReactNode }) {
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  return <PlannerContext.Provider value={{ ...runtime, revision, refresh }}>{children}</PlannerContext.Provider>;
}

export function usePlanner(): PlannerContextValue {
  const value = useContext(PlannerContext);
  if (value === null) throw new Error("Planner components must be rendered inside PlannerProvider.");
  return value;
}
