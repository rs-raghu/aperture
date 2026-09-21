import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

import { createMobileSupabaseClient, createSecureSessionStorage } from "../src/lib/auth/mobile-auth";

jest.mock("expo-secure-store", () => ({
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 3,
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ auth: {} })),
}));

describe("mobile authentication storage", () => {
  it("stores persisted Supabase sessions only through Expo SecureStore", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue("encrypted-session-envelope");
    const storage = createSecureSessionStorage();
    expect(await storage.getItem("sb-project-auth-token")).toBe("encrypted-session-envelope");
    await storage.setItem("sb-project-auth-token", "new-session-envelope");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "sb-project-auth-token",
      "new-session-envelope",
      { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY },
    );
    await storage.removeItem("sb-project-auth-token");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("sb-project-auth-token");
  });

  it("uses persisted PKCE without browser URL session detection", () => {
    const storage = createSecureSessionStorage();
    createMobileSupabaseClient({
      mode: "supabase",
      supabaseUrl: "https://example.supabase.co",
      supabasePublishableKey: "synthetic-public-key",
      ownerEmail: "owner@example.invalid",
    }, storage);
    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "synthetic-public-key",
      {
        auth: {
          storage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          flowType: "pkce",
        },
      },
    );
  });
});
