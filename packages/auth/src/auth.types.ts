import type {
  AuthenticationCallbackInput,
  AuthenticationCallbackResult,
  AuthenticationChangeListener,
  AuthenticationChangeSubscription,
  PasswordResetRequest,
  PasswordUpdateInput,
  PlatformSession,
  PlatformUser,
  SignInInput,
  SignInResult,
} from "@aperture/platform-contracts";

export type AuthenticationErrorCode =
  | "authentication-callback-invalid"
  | "authentication-configuration-invalid"
  | "authentication-expired-session"
  | "authentication-provider-failure"
  | "authentication-session-missing"
  | "authentication-user-denied";

export class AuthenticationError extends Error {
  public readonly name = "AuthenticationError";

  public constructor(
    public readonly code: AuthenticationErrorCode,
    message: string,
    public readonly details: Readonly<Record<string, unknown>> = {},
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export interface PersonalAuthenticationConfiguration {
  readonly ownerEmail: string;
  readonly ownerId?: string;
  readonly now?: () => Date;
}

export interface AuthenticationService {
  signIn(input: SignInInput): Promise<SignInResult>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<PlatformUser | null>;
  getCurrentSession(): Promise<PlatformSession | null>;
  refreshSession(): Promise<PlatformSession>;
  requestPasswordReset(input: PasswordResetRequest): Promise<void>;
  updatePassword(input: PasswordUpdateInput): Promise<void>;
  handleAuthenticationCallback(input: AuthenticationCallbackInput): Promise<AuthenticationCallbackResult>;
  subscribeToAuthenticationChanges(listener: AuthenticationChangeListener): AuthenticationChangeSubscription;
}

export type AuthenticationMode = "supabase" | "development-bypass";

export interface DevelopmentBypassEnvironment {
  readonly NODE_ENV?: string;
  readonly APERTURE_AUTH_DEV_BYPASS?: string;
}
