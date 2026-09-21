import { createEducationService, type EducationClock } from "@aperture/education";
import { allFinanceCalculatorPlugins, createFinanceApplicationService } from "@aperture/finance";
import { createHealthService, type HealthClock } from "@aperture/health";
import {
  createPreviewRepositorySet,
  createSupabaseRepositorySet,
  type CloudSynchronizationSnapshot,
} from "@aperture/supabase-repositories";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "expo-crypto";
import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { EducationMobileRuntime } from "../../features/education/adapters/education-runtime";
import { EducationProvider } from "../../features/education/providers/education-provider";
import type { FinanceMobileRuntime } from "../../features/finance/adapters/finance-runtime";
import { FinanceProvider } from "../../features/finance/providers/finance-provider";
import type { HealthMobileRuntime } from "../../features/health/adapters/health-runtime";
import { HealthProvider } from "../../features/health/providers/health-provider";
import { useMobileAuth } from "../auth/mobile-auth-provider";

export interface MobileDataComposition {
  readonly education: EducationMobileRuntime;
  readonly health: HealthMobileRuntime;
  readonly finance: FinanceMobileRuntime;
  readonly mode: "memory" | "supabase";
  readonly snapshots: () => readonly CloudSynchronizationSnapshot[];
  readonly subscribe: (listener: () => void) => () => void;
}

interface MobileDataStatus {
  readonly mode: "memory" | "supabase";
  readonly synchronization: readonly CloudSynchronizationSnapshot[];
}

const MobileDataContext = createContext<MobileDataStatus | null>(null);
const EMPTY_SYNCHRONIZATION: readonly CloudSynchronizationSnapshot[] = Object.freeze([]);

function synchronizationLabel(status: MobileDataStatus): string {
  if (status.mode === "memory") return "Preview data · temporary memory";
  if (status.synchronization.some(({ state }) => state === "failed")) return "Cloud data · synchronization failed";
  if (status.synchronization.some(({ state }) => state === "synchronizing")) return "Cloud data · synchronizing";
  if (status.synchronization.some(({ state }) => state === "synchronized")) return "Cloud data · synchronized";
  return "Cloud data · ready";
}

export function createMobileDataComposition(
  ownerId: string,
  mode: ReturnType<typeof useMobileAuth>["mode"],
  supabaseClient: SupabaseClient | null,
): MobileDataComposition {
  const durable = mode === "supabase" && supabaseClient !== null
    ? createSupabaseRepositorySet(supabaseClient, {
        health: { generateId: randomUUID },
        finance: { generateId: () => randomUUID() },
      })
    : null;
  const repositories = durable ?? createPreviewRepositorySet();
  const now = () => new Date().toISOString();
  const educationClock: EducationClock = Object.freeze({ now });
  const healthClock: HealthClock = Object.freeze({ now });
  return Object.freeze({
    education: Object.freeze({
      service: createEducationService({ repositories: repositories.education, clock: educationClock, idGenerator: { generate: randomUUID } }),
      context: Object.freeze({ ownerId }),
      clock: educationClock,
    }),
    health: Object.freeze({
      service: createHealthService({ repositories: repositories.health, clock: healthClock, idGenerator: { generate: randomUUID } }),
      context: Object.freeze({ ownerId }),
      clock: healthClock,
    }),
    finance: Object.freeze({
      service: createFinanceApplicationService({
        repositories: repositories.finance,
        calculatorRegistry: allFinanceCalculatorPlugins,
        clock: { now },
        idGenerator: { next: (scope: string) => `${scope.replaceAll(" ", "-")}-${randomUUID()}` },
      }),
      context: Object.freeze({ ownerId }),
    }),
    mode: durable === null ? "memory" : "supabase",
    snapshots: () => durable?.synchronization.getAllSnapshots() ?? EMPTY_SYNCHRONIZATION,
    subscribe: (listener: () => void) => durable?.synchronization.subscribe(listener) ?? (() => undefined),
  });
}

export function MobileDataProvider({ children }: { readonly children: ReactNode }) {
  const authentication = useMobileAuth();
  const ownerId = authentication.user?.ownerId ?? "";
  const composition = useMemo(
    () => {
      if (ownerId.length === 0) throw new Error("MobileDataProvider requires an authenticated owner.");
      return createMobileDataComposition(ownerId, authentication.mode, authentication.supabaseClient);
    },
    [authentication.mode, authentication.supabaseClient, ownerId],
  );
  const synchronization = useSyncExternalStore(composition.subscribe, composition.snapshots, composition.snapshots);
  const status = useMemo(() => ({ mode: composition.mode, synchronization }), [composition.mode, synchronization]);
  return (
    <MobileDataContext.Provider value={status}>
      <View style={styles.container}>
        <View style={styles.status} accessibilityRole="summary" accessibilityLiveRegion="polite">
          <Text style={styles.statusText}>{synchronizationLabel(status)}</Text>
        </View>
        <FinanceProvider ownerId={ownerId} createRuntime={() => composition.finance}>
          <EducationProvider ownerId={ownerId} createRuntime={() => composition.education}>
            <HealthProvider ownerId={ownerId} createRuntime={() => composition.health}>
              {children}
            </HealthProvider>
          </EducationProvider>
        </FinanceProvider>
      </View>
    </MobileDataContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  status: { backgroundColor: "#e8eef5", borderBottomColor: "#c8d3df", borderBottomWidth: 1, paddingHorizontal: 14, paddingVertical: 6 },
  statusText: { color: "#334e68", fontSize: 12, fontWeight: "700", textAlign: "center" },
});

export function useMobileDataStatus(): MobileDataStatus {
  const value = useContext(MobileDataContext);
  if (value === null) throw new Error("useMobileDataStatus must be used within MobileDataProvider.");
  return value;
}
