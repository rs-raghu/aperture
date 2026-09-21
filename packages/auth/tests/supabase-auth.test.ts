import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  AuthenticationError,
  createSupabaseAuthenticationService,
  resolveAuthenticationMode,
} from "../src/index.js";

const OWNER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OWNER_EMAIL = "owner@example.invalid";
const NOW_SECONDS = 2_208_988_800;

function user(overrides: Partial<User> = {}): User {
  return {
    id: OWNER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: OWNER_EMAIL,
    created_at: "2039-01-01T00:00:00.000Z",
    updated_at: "2040-01-01T00:00:00.000Z",
    app_metadata: {},
    user_metadata: { display_name: "Owner" },
    ...overrides,
  };
}

function session(overrides: Partial<Session> = {}): Session {
  return {
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    expires_in: 3600,
    expires_at: NOW_SECONDS + 3600,
    token_type: "bearer",
    user: user(),
    ...overrides,
  };
}

function client(currentSession: Session | null = session()) {
  const subscription = { unsubscribe: vi.fn() };
  const auth = {
    signInWithPassword: vi.fn(async () => ({ data: { user: currentSession?.user ?? null, session: currentSession }, error: null })),
    signOut: vi.fn(async () => ({ error: null })),
    getUser: vi.fn(async () => ({ data: { user: currentSession?.user ?? null }, error: null })),
    getSession: vi.fn(async () => ({ data: { session: currentSession }, error: null })),
    refreshSession: vi.fn(async () => ({ data: { user: currentSession?.user ?? null, session: currentSession }, error: null })),
    resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })),
    updateUser: vi.fn(async () => ({ data: { user: currentSession?.user ?? null }, error: null })),
    exchangeCodeForSession: vi.fn(async () => ({ data: { user: currentSession!.user, session: currentSession! }, error: null })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription } })),
  };
  return { auth, client: { auth } as unknown as SupabaseClient };
}

function service(supabase: SupabaseClient) {
  return createSupabaseAuthenticationService(supabase, {
    ownerEmail: OWNER_EMAIL,
    ownerId: OWNER_ID,
    now: () => new Date(NOW_SECONDS * 1000),
  });
}

describe("personal Supabase authentication", () => {
  it("allows only the configured owner and maps no provider tokens into the session", async () => {
    const fixture = client();
    const result = await service(fixture.client).signIn({ email: OWNER_EMAIL.toUpperCase(), password: "synthetic-password" });
    expect(result.user).toMatchObject({ id: OWNER_ID, ownerId: OWNER_ID, email: OWNER_EMAIL, displayName: "Owner" });
    expect(result.session).toEqual({ id: `${OWNER_ID}:${NOW_SECONDS + 3600}`, userId: OWNER_ID, expiresAt: new Date((NOW_SECONDS + 3600) * 1000).toISOString() });
    expect(JSON.stringify(result)).not.toContain("test-access-token");
  });

  it("rejects an unknown address before sending credentials to the provider", async () => {
    const fixture = client();
    await expect(service(fixture.client).signIn({ email: "unknown@example.invalid", password: "synthetic-password" })).rejects.toMatchObject({ code: "authentication-user-denied" });
    expect(fixture.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("signs out a provider session whose user does not match the allowlist", async () => {
    const fixture = client(session({ user: user({ id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }) }));
    await expect(service(fixture.client).getCurrentUser()).rejects.toMatchObject({ code: "authentication-user-denied" });
    expect(fixture.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("returns null for unauthenticated and expired sessions", async () => {
    const anonymous = client(null);
    expect(await service(anonymous.client).getCurrentUser()).toBeNull();
    expect(await service(anonymous.client).getCurrentSession()).toBeNull();
    const expired = client(session({ expires_at: NOW_SECONDS - 1 }));
    expect(await service(expired.client).getCurrentSession()).toBeNull();
  });

  it("refreshes, logs out, exchanges PKCE callbacks, and updates passwords", async () => {
    const fixture = client();
    const authentication = service(fixture.client);
    expect(await authentication.refreshSession()).toMatchObject({ userId: OWNER_ID });
    expect(await authentication.handleAuthenticationCallback({ callbackUrl: "aperture://auth/callback?code=synthetic-code" })).toMatchObject({ user: { id: OWNER_ID } });
    expect(fixture.auth.exchangeCodeForSession).toHaveBeenCalledWith("synthetic-code");
    await authentication.updatePassword({ password: "new-synthetic-password" });
    await authentication.signOut();
    expect(fixture.auth.updateUser).toHaveBeenCalled();
    expect(fixture.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("rejects malformed callbacks with a structured error", async () => {
    const fixture = client();
    await expect(service(fixture.client).handleAuthenticationCallback({ callbackUrl: "aperture://auth/callback" })).rejects.toBeInstanceOf(AuthenticationError);
    await expect(service(fixture.client).handleAuthenticationCallback({ callbackUrl: "aperture://auth/callback" })).rejects.toMatchObject({ code: "authentication-callback-invalid" });
  });
});

describe("development authentication bypass", () => {
  it("is available only when explicitly enabled in development", () => {
    expect(resolveAuthenticationMode({ NODE_ENV: "development", APERTURE_AUTH_DEV_BYPASS: "true" })).toBe("development-bypass");
    expect(resolveAuthenticationMode({ NODE_ENV: "development" })).toBe("supabase");
  });

  it.each(["production", "preview", "test"])("is rejected in %s", (NODE_ENV) => {
    expect(() => resolveAuthenticationMode({ NODE_ENV, APERTURE_AUTH_DEV_BYPASS: "true" })).toThrowError(AuthenticationError);
  });
});
