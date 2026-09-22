"use client";

import type { TodayService } from "@aperture/today";
import { createContext, useContext, type ReactNode } from "react";

export interface TodayWebRuntime { readonly service: TodayService; readonly ownerId: string; readonly now: () => string; }
const TodayContext = createContext<TodayWebRuntime | null>(null);

export function TodayProvider({ runtime, children }: { readonly runtime: TodayWebRuntime; readonly children: ReactNode }) {
  return <TodayContext.Provider value={runtime}>{children}</TodayContext.Provider>;
}

export function useToday(): TodayWebRuntime {
  const value = useContext(TodayContext);
  if (value === null) throw new Error("Today components must be rendered inside TodayProvider.");
  return value;
}
