import { describe, expect, it } from "vitest";

import { readWebAuthenticationConfiguration } from "@/lib/auth/configuration";

describe("web authentication configuration", () => {
  it("requires the Supabase public boundary and owner allowlist", () => {
    expect(readWebAuthenticationConfiguration({
      NODE_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-public-key",
      APERTURE_OWNER_EMAIL: "owner@example.invalid",
      APERTURE_OWNER_ID: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    })).toEqual({
      mode: "supabase",
      supabaseUrl: "https://example.supabase.co",
      supabasePublishableKey: "synthetic-public-key",
      ownerEmail: "owner@example.invalid",
      ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });
  });

  it("allows the bypass only when local development explicitly requests it", () => {
    expect(readWebAuthenticationConfiguration({
      NODE_ENV: "development",
      APERTURE_AUTH_DEV_BYPASS: "true",
    })).toMatchObject({ mode: "development-bypass", ownerEmail: "synthetic-owner@example.invalid" });
    expect(() => readWebAuthenticationConfiguration({
      NODE_ENV: "production",
      APERTURE_AUTH_DEV_BYPASS: "true",
    })).toThrow(/forbidden/i);
  });

  it("fails closed when production credentials are missing", () => {
    expect(() => readWebAuthenticationConfiguration({ NODE_ENV: "production" })).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});
