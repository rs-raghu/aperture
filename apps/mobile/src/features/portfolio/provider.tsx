import { createContext, useContext, useMemo, type ReactNode } from "react";
import { randomUUID } from "expo-crypto";
import { createPortfolioMemoryRepository, createPortfolioService, type PortfolioRuntime } from "@aperture/portfolio";
import { createSupabasePortfolioRepository } from "@aperture/portfolio/supabase";
import { useMobileAuth } from "../../lib/auth/mobile-auth-provider";
const PortfolioContext = createContext<PortfolioRuntime | null>(null);
export function PortfolioProvider({ runtime: injected, children }: { readonly runtime?: PortfolioRuntime; readonly children?: ReactNode }) {
  const auth = useMobileAuth();
  const runtime = useMemo(() => {
    if (injected !== undefined) return injected;
    if (auth.user === null) throw new Error("Sign in to edit your portfolio.");
    const repository = auth.mode === "development-bypass" ? createPortfolioMemoryRepository() : auth.supabaseClient === null ? null : createSupabasePortfolioRepository(auth.supabaseClient);
    if (repository === null) throw new Error("Portfolio storage is unavailable.");
    return { ownerId: auth.user.ownerId, service: createPortfolioService({ repository, clock: { now: () => new Date().toISOString() }, idGenerator: { generate: randomUUID } }) };
  }, [auth.mode, auth.supabaseClient, auth.user, injected]);
  return <PortfolioContext.Provider value={runtime}>{children}</PortfolioContext.Provider>;
}
export function usePortfolio(): PortfolioRuntime { const value = useContext(PortfolioContext); if (value === null) throw new Error("Portfolio editing requires its provider."); return value; }
