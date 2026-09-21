"use client";

import { createEducationService, type EducationClock } from "@aperture/education";
import { allFinanceCalculatorPlugins, createFinanceApplicationService } from "@aperture/finance";
import { createHealthService, type HealthClock } from "@aperture/health";
import {
  createPreviewRepositorySet,
  createSupabaseRepositorySet,
  type CloudSynchronizationSnapshot,
} from "@aperture/supabase-repositories";
import { createBrowserClient } from "@supabase/ssr";
import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import type { EducationWebRuntime } from "@/features/education/adapters/education-runtime";
import { EducationProvider } from "@/features/education/providers/education-provider";
import type { FinanceWebRuntime } from "@/features/finance/adapters/finance-runtime";
import { FinanceProvider } from "@/features/finance/providers/finance-provider";
import type { HealthWebRuntime } from "@/features/health/adapters/health-runtime";
import { HealthProvider } from "@/features/health/providers/health-provider";

export type WebDataConfiguration =
  | { readonly mode: "memory"; readonly ownerId: string }
  | {
      readonly mode: "supabase";
      readonly ownerId: string;
      readonly supabaseUrl: string;
      readonly supabasePublishableKey: string;
    };

export interface WebDataComposition {
  readonly education: EducationWebRuntime;
  readonly health: HealthWebRuntime;
  readonly finance: FinanceWebRuntime;
  readonly mode: WebDataConfiguration["mode"];
  readonly snapshots: () => readonly CloudSynchronizationSnapshot[];
  readonly subscribe: (listener: () => void) => () => void;
}

interface WebDataStatus {
  readonly mode: WebDataConfiguration["mode"];
  readonly synchronization: readonly CloudSynchronizationSnapshot[];
}

const WebDataContext = createContext<WebDataStatus | null>(null);
const EMPTY_SYNCHRONIZATION: readonly CloudSynchronizationSnapshot[] = Object.freeze([]);

function synchronizationLabel(status: WebDataStatus): string {
  if (status.mode === "memory") return "Preview data · temporary memory";
  if (status.synchronization.some(({ state }) => state === "failed")) return "Cloud data · synchronization failed";
  if (status.synchronization.some(({ state }) => state === "synchronizing")) return "Cloud data · synchronizing";
  if (status.synchronization.some(({ state }) => state === "synchronized")) return "Cloud data · synchronized";
  return "Cloud data · ready";
}

export function createWebDataComposition(configuration: WebDataConfiguration): WebDataComposition {
  const durable = configuration.mode === "supabase"
    ? createSupabaseRepositorySet(createBrowserClient(configuration.supabaseUrl, configuration.supabasePublishableKey))
    : null;
  const repositories = durable ?? createPreviewRepositorySet();
  const now = () => new Date().toISOString();
  const educationClock: EducationClock = Object.freeze({ now });
  const healthClock: HealthClock = Object.freeze({ now });
  const education = Object.freeze({
    service: createEducationService({ repositories: repositories.education, clock: educationClock, idGenerator: { generate: () => crypto.randomUUID() } }),
    context: Object.freeze({ ownerId: configuration.ownerId }),
    clock: educationClock,
  });
  const health = Object.freeze({
    service: createHealthService({ repositories: repositories.health, clock: healthClock, idGenerator: { generate: () => crypto.randomUUID() } }),
    context: Object.freeze({ ownerId: configuration.ownerId }),
    clock: healthClock,
  });
  const finance = Object.freeze({
    service: createFinanceApplicationService({
      repositories: repositories.finance,
      calculatorRegistry: allFinanceCalculatorPlugins,
      clock: { now },
      idGenerator: { next: (scope: string) => `${scope.replaceAll(" ", "-")}-${crypto.randomUUID()}` },
    }),
    context: Object.freeze({ ownerId: configuration.ownerId }),
  });
  return Object.freeze({
    education,
    health,
    finance,
    mode: configuration.mode,
    snapshots: () => durable?.synchronization.getAllSnapshots() ?? EMPTY_SYNCHRONIZATION,
    subscribe: (listener: () => void) => durable?.synchronization.subscribe(listener) ?? (() => undefined),
  });
}

export function WebDataProvider({ configuration, children }: { readonly configuration: WebDataConfiguration; readonly children: ReactNode }) {
  const [composition] = useState(() => createWebDataComposition(configuration));
  const synchronization = useSyncExternalStore(composition.subscribe, composition.snapshots, composition.snapshots);
  const status = useMemo(() => ({ mode: composition.mode, synchronization }), [composition.mode, synchronization]);
  return (
    <WebDataContext.Provider value={status}>
      <div className="data-sync-status" role="status" aria-live="polite">{synchronizationLabel(status)}</div>
      <FinanceProvider ownerId={configuration.ownerId} createRuntime={() => composition.finance}>
        <EducationProvider ownerId={configuration.ownerId} createRuntime={() => composition.education}>
          <HealthProvider ownerId={configuration.ownerId} createRuntime={() => composition.health}>
            {children}
          </HealthProvider>
        </EducationProvider>
      </FinanceProvider>
    </WebDataContext.Provider>
  );
}

export function useWebDataStatus(): WebDataStatus {
  const value = useContext(WebDataContext);
  if (value === null) throw new Error("useWebDataStatus must be used within WebDataProvider.");
  return value;
}
