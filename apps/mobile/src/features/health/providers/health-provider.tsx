import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { createHealthMobileRuntime, HEALTH_DEVELOPMENT_MOBILE_OWNER_ID, type HealthMobileRuntime } from "../adapters/health-runtime";

export interface HealthContextValue extends HealthMobileRuntime {
  readonly revision: number;
  readonly refresh: () => void;
}

const HealthContext = createContext<HealthContextValue | null>(null);

export interface HealthProviderProps {
  readonly children: ReactNode;
  readonly ownerId?: string;
  readonly createRuntime?: (ownerId: string) => HealthMobileRuntime;
}

export function HealthProvider({ children, ownerId = HEALTH_DEVELOPMENT_MOBILE_OWNER_ID, createRuntime = createHealthMobileRuntime }: HealthProviderProps) {
  const [runtime] = useState(() => createRuntime(ownerId));
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  return <HealthContext.Provider value={{ ...runtime, revision, refresh }}>{children}</HealthContext.Provider>;
}

export function useHealth(): HealthContextValue {
  const value = useContext(HealthContext);
  if (value === null) throw new Error("Health mobile components must be rendered inside HealthProvider.");
  return value;
}
