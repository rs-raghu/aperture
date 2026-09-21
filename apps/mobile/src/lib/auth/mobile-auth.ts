import "react-native-url-polyfill/auto";

import { createSupabaseAuthenticationService, resolveAuthenticationMode } from "@aperture/auth";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

export interface MobileAuthenticationConfiguration {
  readonly mode: "supabase" | "development-bypass";
  readonly supabaseUrl?: string;
  readonly supabasePublishableKey?: string;
  readonly ownerEmail: string;
  readonly ownerId?: string;
}

export interface SecureStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createSecureSessionStorage(): SecureStorage {
  return {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    }),
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  };
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value.length === 0) throw new Error(`Missing required mobile authentication variable ${name}.`);
  return value;
}

export function readMobileAuthenticationConfiguration(): MobileAuthenticationConfiguration {
  const bypass = process.env.EXPO_PUBLIC_APERTURE_AUTH_DEV_BYPASS;
  const mode = resolveAuthenticationMode({
    NODE_ENV: __DEV__ ? "development" : "production",
    APERTURE_AUTH_DEV_BYPASS: bypass,
  });
  const ownerId = process.env.EXPO_PUBLIC_APERTURE_OWNER_ID?.trim();
  if (mode === "development-bypass") {
    return {
      mode,
      ownerEmail: process.env.EXPO_PUBLIC_APERTURE_OWNER_EMAIL?.trim() || "synthetic-owner@example.invalid",
      ownerId: ownerId || "70000000-0000-4000-8000-000000000001",
    };
  }
  return {
    mode,
    supabaseUrl: required("EXPO_PUBLIC_SUPABASE_URL"),
    supabasePublishableKey: required("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    ownerEmail: required("EXPO_PUBLIC_APERTURE_OWNER_EMAIL"),
    ...(ownerId === undefined || ownerId.length === 0 ? {} : { ownerId }),
  };
}

export function createMobileSupabaseClient(
  configuration: MobileAuthenticationConfiguration,
  storage: SecureStorage = createSecureSessionStorage(),
): SupabaseClient {
  if (configuration.mode !== "supabase") throw new Error("Supabase is disabled in development bypass mode.");
  return createClient(configuration.supabaseUrl!, configuration.supabasePublishableKey!, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  });
}

export function createMobileAuthentication(
  configuration = readMobileAuthenticationConfiguration(),
  storage?: SecureStorage,
) {
  if (configuration.mode !== "supabase") return null;
  const client = createMobileSupabaseClient(configuration, storage);
  return {
    client,
    service: createSupabaseAuthenticationService(client, configuration),
  };
}
