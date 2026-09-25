"use client";

import type { SettingsClientSnapshot, SettingsService, UpdateSettingsInput, UserSettings } from "@aperture/settings";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface SettingsWebRuntime { readonly service: SettingsService; readonly ownerId: string; }
interface SettingsContextValue {
  readonly snapshot: SettingsClientSnapshot | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly update: (input: UpdateSettingsInput) => Promise<UserSettings>;
  readonly updatePlatform: (input: Partial<UserSettings["platform"]["web"]>) => Promise<UserSettings>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ runtime, children }: { readonly runtime: SettingsWebRuntime; readonly children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<SettingsClientSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void runtime.service.getClientSnapshot({ ownerId: runtime.ownerId }).then((value) => { if (active) { setSnapshot(value); setError(null); } }).catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Unable to load settings."); });
    return () => { active = false; };
  }, [runtime]);
  const apply = useCallback((preferences: UserSettings) => setSnapshot((current) => ({ preferences, integrations: current?.integrations ?? [] })), []);
  const update = useCallback(async (input: UpdateSettingsInput) => {
    try { const value = await runtime.service.updateSettings({ ownerId: runtime.ownerId }, input); apply(value); setError(null); return value; }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save settings."); throw caught; }
  }, [apply, runtime]);
  const updatePlatform = useCallback(async (input: Partial<UserSettings["platform"]["web"]>) => {
    try { const value = await runtime.service.updatePlatformSettings({ ownerId: runtime.ownerId }, "web", input); apply(value); setError(null); return value; }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save web settings."); throw caught; }
  }, [apply, runtime]);
  const value = useMemo(() => ({ snapshot, loading: snapshot === null && error === null, error, update, updatePlatform }), [error, snapshot, update, updatePlatform]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (value === null) throw new Error("useSettings must be used within SettingsProvider.");
  return value;
}

export function useOptionalSettings(): SettingsContextValue | null { return useContext(SettingsContext); }
