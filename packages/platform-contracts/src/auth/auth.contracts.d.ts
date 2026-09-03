import type {
  AuthenticationCallbackInput,
  AuthenticationCallbackResult,
  AuthenticationChangeListener,
  AuthenticationChangeSubscription,
  PasswordResetRequest,
  PasswordUpdateInput,
  SignInInput,
  SignInResult
} from "./auth.types.js";
import type { PlatformSession } from "../sessions/session.types.js";
import type { PlatformUser } from "../users/user.types.js";

export declare function signIn(input: SignInInput): Promise<SignInResult>;
export declare function signOut(): Promise<void>;
export declare function getCurrentUser(): Promise<PlatformUser | null>;
export declare function getCurrentSession(): Promise<PlatformSession | null>;
export declare function refreshSession(): Promise<PlatformSession>;
export declare function requestPasswordReset(input: PasswordResetRequest): Promise<void>;
export declare function updatePassword(input: PasswordUpdateInput): Promise<void>;
export declare function handleAuthenticationCallback(
  input: AuthenticationCallbackInput
): Promise<AuthenticationCallbackResult>;
export declare function subscribeToAuthenticationChanges(
  listener: AuthenticationChangeListener
): AuthenticationChangeSubscription;
