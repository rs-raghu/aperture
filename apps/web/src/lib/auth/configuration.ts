import { resolveAuthenticationMode, type AuthenticationMode } from "@aperture/auth";

export interface WebAuthenticationConfiguration {
  readonly mode: AuthenticationMode;
  readonly supabaseUrl?: string;
  readonly supabasePublishableKey?: string;
  readonly ownerEmail: string;
  readonly ownerId?: string;
}

function required(environment: NodeJS.ProcessEnv, name: string): string {
  const value = environment[name]?.trim();
  if (value === undefined || value.length === 0) throw new Error(`Missing required authentication variable ${name}.`);
  return value;
}

export function readWebAuthenticationConfiguration(
  environment: NodeJS.ProcessEnv = process.env,
): WebAuthenticationConfiguration {
  const mode = resolveAuthenticationMode(environment);
  if (mode === "development-bypass") {
    return {
      mode,
      ownerEmail: environment.APERTURE_OWNER_EMAIL?.trim() || "synthetic-owner@example.invalid",
      ownerId: environment.APERTURE_OWNER_ID?.trim() || "70000000-0000-4000-8000-000000000001",
    };
  }
  const ownerId = environment.APERTURE_OWNER_ID?.trim();
  return {
    mode,
    supabaseUrl: required(environment, "NEXT_PUBLIC_SUPABASE_URL"),
    supabasePublishableKey: required(environment, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    ownerEmail: required(environment, "APERTURE_OWNER_EMAIL"),
    ...(ownerId === undefined || ownerId.length === 0 ? {} : { ownerId }),
  };
}
