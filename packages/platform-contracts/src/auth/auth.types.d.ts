import type { PlatformUser } from "../users/user.types.js";
import type { PlatformSession } from "../sessions/session.types.js";
import type { Unsubscribe } from "../platform.types.js";

export interface SignInInput {
  readonly email: string;
  readonly password: string;
}

export interface SignInResult {
  readonly user: PlatformUser;
  readonly session: PlatformSession;
}

export interface PasswordResetRequest {
  readonly email: string;
  readonly redirectUrl?: string;
}

export interface PasswordUpdateInput {
  readonly password: string;
}

export interface AuthenticationCallbackInput {
  readonly callbackUrl: string;
}

export interface AuthenticationCallbackResult {
  readonly user: PlatformUser;
  readonly session: PlatformSession;
}

export type AuthenticationChangeType =
  | "signed-in"
  | "signed-out"
  | "session-refreshed"
  | "password-recovery";

export interface AuthenticationChange {
  readonly type: AuthenticationChangeType;
  readonly user: PlatformUser | null;
  readonly session: PlatformSession | null;
}

export type AuthenticationChangeListener = (
  change: AuthenticationChange
) => void;

export type AuthenticationChangeSubscription = Unsubscribe;
