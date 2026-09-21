import type { PlatformUser } from "@aperture/platform-contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  createMobileAuthentication,
  readMobileAuthenticationConfiguration,
} from "./mobile-auth";

export interface MobileAuthValue {
  readonly loading: boolean;
  readonly user: PlatformUser | null;
  readonly error: string | null;
  readonly mode: "supabase" | "development-bypass" | "unavailable";
  readonly supabaseClient: SupabaseClient | null;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const MobileAuthContext = createContext<MobileAuthValue | null>(null);

export function MobileAuthProvider({ children }: { readonly children: ReactNode }) {
  const runtime = useMemo(() => {
    try {
      const configuration = readMobileAuthenticationConfiguration();
      const now = new Date().toISOString();
      const bypassUser: PlatformUser | null = configuration.mode === "development-bypass" ? {
        id: configuration.ownerId!,
        ownerId: configuration.ownerId!,
        email: configuration.ownerEmail,
        displayName: "Development owner",
        createdAt: now,
        updatedAt: now,
      } : null;
      return { configuration, authentication: createMobileAuthentication(configuration), bypassUser, error: null };
    } catch {
      return { configuration: null, authentication: null, bypassUser: null, error: "Authentication is not configured." };
    }
  }, []);
  const [loading, setLoading] = useState(runtime.authentication !== null);
  const [user, setUser] = useState<PlatformUser | null>(runtime.bypassUser);
  const [error, setError] = useState<string | null>(runtime.error);

  useEffect(() => {
    if (runtime.configuration?.mode === "development-bypass") {
      return;
    }
    const authentication = runtime.authentication;
    if (authentication === null) return;
    let active = true;
    void authentication.service.getCurrentUser()
      .then((current) => { if (active) setUser(current); })
      .catch(() => { if (active) setError("The saved session could not be verified."); })
      .finally(() => { if (active) setLoading(false); });
    const unsubscribe = authentication.service.subscribeToAuthenticationChanges((change) => {
      if (active) setUser(change.user);
    });
    const handleUrl = ({ url }: { readonly url: string }) => {
      if (!url.includes("code=")) return;
      void authentication.service.handleAuthenticationCallback({ callbackUrl: url })
        .then((result) => setUser(result.user))
        .catch(() => setError("The sign-in callback could not be completed."));
    };
    const linking = Linking.addEventListener("url", handleUrl);
    void Linking.getInitialURL().then((url) => { if (url !== null) handleUrl({ url }); });
    return () => {
      active = false;
      unsubscribe();
      linking.remove();
    };
  }, [runtime]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (runtime.configuration?.mode === "development-bypass") return;
    if (runtime.authentication === null) throw new Error(runtime.error ?? "Authentication is unavailable.");
    setError(null);
    const result = await runtime.authentication.service.signIn({ email, password });
    setUser(result.user);
  }, [runtime]);

  const signOut = useCallback(async () => {
    if (runtime.authentication !== null) await runtime.authentication.service.signOut();
    setUser(null);
  }, [runtime]);

  const mode = runtime.configuration?.mode ?? "unavailable";
  const supabaseClient = runtime.authentication?.client ?? null;
  return (
    <MobileAuthContext.Provider value={{ loading, user, error, mode, supabaseClient, signIn, signOut }}>
      {children}
    </MobileAuthContext.Provider>
  );
}

export function useMobileAuth(): MobileAuthValue {
  const value = useContext(MobileAuthContext);
  if (value === null) throw new Error("useMobileAuth must be used within MobileAuthProvider.");
  return value;
}
