import {
  AuthenticationError,
  type AuthenticationMode,
  type DevelopmentBypassEnvironment,
} from "./auth.types.js";

export function resolveAuthenticationMode(
  environment: DevelopmentBypassEnvironment,
): AuthenticationMode {
  const bypassRequested = environment.APERTURE_AUTH_DEV_BYPASS === "true";
  if (!bypassRequested) return "supabase";
  if (environment.NODE_ENV !== "development") {
    throw new AuthenticationError(
      "authentication-configuration-invalid",
      "The authentication development bypass is forbidden outside local development.",
      { field: "APERTURE_AUTH_DEV_BYPASS" },
    );
  }
  return "development-bypass";
}
