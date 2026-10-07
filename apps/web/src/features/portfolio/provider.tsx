"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { createPortfolioMemoryRepository, createPortfolioService, type PortfolioRuntime } from "@aperture/portfolio";
import { createSupabasePortfolioRepository } from "@aperture/portfolio/supabase";
export type PortfolioWebConfiguration = { readonly mode: "memory"; readonly ownerId: string } | { readonly mode: "supabase"; readonly ownerId: string; readonly supabaseUrl: string; readonly supabasePublishableKey: string };
const PortfolioContext = createContext<PortfolioRuntime | null>(null);
export function PortfolioProvider({ configuration, runtime: injected, children }: { readonly configuration?: PortfolioWebConfiguration; readonly runtime?: PortfolioRuntime; readonly children: ReactNode }) {
  const runtime = useMemo(() => {
    if (injected !== undefined) return injected;
    if (configuration === undefined) throw new Error("Portfolio configuration is missing.");
    const repository = configuration.mode === "memory" ? createPortfolioMemoryRepository() : createSupabasePortfolioRepository(createBrowserClient(configuration.supabaseUrl, configuration.supabasePublishableKey));
    return { ownerId: configuration.ownerId, service: createPortfolioService({ repository, clock: { now: () => new Date().toISOString() }, idGenerator: { generate: () => crypto.randomUUID() } }) };
  }, [configuration, injected]);
  return <PortfolioContext.Provider value={runtime}>{children}</PortfolioContext.Provider>;
}
export function usePortfolio(): PortfolioRuntime { const value = useContext(PortfolioContext); if (value === null) throw new Error("Portfolio editing requires its provider."); return value; }
