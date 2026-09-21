import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import type {
  AuthenticationCallbackInput,
  AuthenticationChange,
  AuthenticationChangeListener,
  PasswordResetRequest,
  PasswordUpdateInput,
  PlatformSession,
  PlatformUser,
  SignInInput,
  SignInResult,
} from "@aperture/platform-contracts";

import {
  AuthenticationError,
  type AuthenticationService,
  type PersonalAuthenticationConfiguration,
} from "./auth.types.js";

function normalizedEmail(email: string): string {
  return email.trim().toLowerCase();
}

function providerFailure(error: unknown, operation: string): AuthenticationError {
  if (error instanceof AuthenticationError) return error;
  return new AuthenticationError(
    "authentication-provider-failure",
    `The authentication provider could not complete ${operation}.`,
    { operation },
    { cause: error },
  );
}

function isMissingSession(error: { readonly name?: string | undefined; readonly status?: number | undefined } | null): boolean {
  return error?.name === "AuthSessionMissingError" || error?.status === 401;
}

export function createSupabaseAuthenticationService(
  client: SupabaseClient,
  configuration: PersonalAuthenticationConfiguration,
): AuthenticationService {
  const ownerEmail = normalizedEmail(configuration.ownerEmail);
  if (ownerEmail.length === 0 || !ownerEmail.includes("@")) {
    throw new AuthenticationError(
      "authentication-configuration-invalid",
      "A valid owner email allowlist entry is required.",
      { field: "ownerEmail" },
    );
  }
  const now = configuration.now ?? (() => new Date());

  function assertAllowed(user: User): void {
    const emailMatches = typeof user.email === "string" && normalizedEmail(user.email) === ownerEmail;
    const idMatches = configuration.ownerId === undefined || user.id === configuration.ownerId;
    if (!emailMatches || !idMatches) {
      throw new AuthenticationError(
        "authentication-user-denied",
        "This account is not allowed to access this personal application.",
      );
    }
  }

  function mapUser(user: User): PlatformUser {
    assertAllowed(user);
    const displayName = typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : undefined;
    return {
      id: user.id,
      ownerId: user.id,
      email: user.email!,
      ...(displayName === undefined ? {} : { displayName }),
      createdAt: user.created_at,
      updatedAt: user.updated_at ?? user.created_at,
    };
  }

  function mapSession(session: Session): PlatformSession {
    assertAllowed(session.user);
    if (session.expires_at === undefined) {
      throw new AuthenticationError(
        "authentication-expired-session",
        "The authentication session has no valid expiration time.",
      );
    }
    return {
      id: `${session.user.id}:${session.expires_at}`,
      userId: session.user.id,
      expiresAt: new Date(session.expires_at * 1000).toISOString(),
    };
  }

  function isExpired(session: Session): boolean {
    return session.expires_at === undefined || session.expires_at * 1000 <= now().getTime();
  }

  function mapResult(session: Session): SignInResult {
    if (isExpired(session)) {
      throw new AuthenticationError(
        "authentication-expired-session",
        "The authentication session has expired.",
      );
    }
    return { user: mapUser(session.user), session: mapSession(session) };
  }

  async function denyAndSignOut(error: unknown): Promise<never> {
    await client.auth.signOut({ scope: "local" });
    throw error;
  }

  return Object.freeze({
    async signIn(input: SignInInput) {
      if (normalizedEmail(input.email) !== ownerEmail) {
        throw new AuthenticationError(
          "authentication-user-denied",
          "This account is not allowed to access this personal application.",
        );
      }
      const { data, error } = await client.auth.signInWithPassword(input);
      if (error !== null) throw providerFailure(error, "sign-in");
      if (data.session === null || data.user === null) {
        throw new AuthenticationError(
          "authentication-session-missing",
          "Sign-in completed without a usable session.",
        );
      }
      try {
        return mapResult(data.session);
      } catch (mappingError) {
        return denyAndSignOut(mappingError);
      }
    },

    async signOut() {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error !== null) throw providerFailure(error, "sign-out");
    },

    async getCurrentUser() {
      const { data, error } = await client.auth.getUser();
      if (error !== null) {
        if (isMissingSession(error)) return null;
        throw providerFailure(error, "current-user lookup");
      }
      if (data.user === null) return null;
      try {
        return mapUser(data.user);
      } catch (mappingError) {
        return denyAndSignOut(mappingError);
      }
    },

    async getCurrentSession() {
      const { data, error } = await client.auth.getSession();
      if (error !== null) {
        if (isMissingSession(error)) return null;
        throw providerFailure(error, "session lookup");
      }
      if (data.session === null || isExpired(data.session)) return null;
      try {
        return mapSession(data.session);
      } catch (mappingError) {
        return denyAndSignOut(mappingError);
      }
    },

    async refreshSession() {
      const { data, error } = await client.auth.refreshSession();
      if (error !== null) throw providerFailure(error, "session refresh");
      if (data.session === null || data.user === null) {
        throw new AuthenticationError(
          "authentication-session-missing",
          "Session refresh completed without a usable session.",
        );
      }
      try {
        return mapResult(data.session).session;
      } catch (mappingError) {
        return denyAndSignOut(mappingError);
      }
    },

    async requestPasswordReset(input: PasswordResetRequest) {
      if (normalizedEmail(input.email) !== ownerEmail) {
        throw new AuthenticationError(
          "authentication-user-denied",
          "This account is not allowed to reset this application's password.",
        );
      }
      const options = input.redirectUrl === undefined ? undefined : { redirectTo: input.redirectUrl };
      const { error } = await client.auth.resetPasswordForEmail(input.email, options);
      if (error !== null) throw providerFailure(error, "password reset");
    },

    async updatePassword(input: PasswordUpdateInput) {
      const { error } = await client.auth.updateUser({ password: input.password });
      if (error !== null) throw providerFailure(error, "password update");
    },

    async handleAuthenticationCallback(input: AuthenticationCallbackInput) {
      let code: string | null;
      try {
        code = new URL(input.callbackUrl).searchParams.get("code");
      } catch (error) {
        throw new AuthenticationError(
          "authentication-callback-invalid",
          "The authentication callback URL is invalid.",
          {},
          { cause: error },
        );
      }
      if (code === null || code.length === 0) {
        throw new AuthenticationError(
          "authentication-callback-invalid",
          "The authentication callback is missing its authorization code.",
        );
      }
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (error !== null) throw providerFailure(error, "authentication callback");
      try {
        return mapResult(data.session);
      } catch (mappingError) {
        return denyAndSignOut(mappingError);
      }
    },

    subscribeToAuthenticationChanges(listener: AuthenticationChangeListener) {
      const { data } = client.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        const type: AuthenticationChange["type"] | undefined = event === "SIGNED_IN"
          ? "signed-in"
          : event === "SIGNED_OUT"
            ? "signed-out"
            : event === "TOKEN_REFRESHED"
              ? "session-refreshed"
              : event === "PASSWORD_RECOVERY"
                ? "password-recovery"
                : undefined;
        if (type === undefined) return;
        if (session === null) {
          listener({ type, user: null, session: null });
          return;
        }
        try {
          listener({ type, user: mapUser(session.user), session: mapSession(session) });
        } catch {
          void client.auth.signOut({ scope: "local" });
          listener({ type: "signed-out", user: null, session: null });
        }
      });
      return () => data.subscription.unsubscribe();
    },
  });
}
