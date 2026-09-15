"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import {
  createHealthWebRuntime,
  HEALTH_DEVELOPMENT_OWNER_ID,
  type HealthWebRuntime,
} from "../adapters/health-runtime";

interface HealthContextValue extends HealthWebRuntime {
  readonly revision: number;
  readonly refresh: () => void;
}

const HealthContext = createContext<HealthContextValue | null>(null);

export interface HealthProviderProps {
  readonly children: ReactNode;
  readonly ownerId?: string;
  readonly createRuntime?: (ownerId: string) => HealthWebRuntime;
}

export function HealthProvider({
  children,
  ownerId = HEALTH_DEVELOPMENT_OWNER_ID,
  createRuntime = createHealthWebRuntime,
}: HealthProviderProps) {
  const [runtime] = useState(() => createRuntime(ownerId));
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  return <HealthContext.Provider value={{ ...runtime, revision, refresh }}>{children}</HealthContext.Provider>;
}

export function useHealth(): HealthContextValue {
  const value = useContext(HealthContext);
  if (value === null) throw new Error("Health components must be rendered inside HealthProvider.");
  return value;
}
