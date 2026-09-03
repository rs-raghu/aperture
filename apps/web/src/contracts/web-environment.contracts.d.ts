export type PublicWebEnvironmentVariable = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | "NEXT_PUBLIC_APP_ORIGIN";
export type ServerWebEnvironmentVariable = "SUPABASE_SERVICE_ROLE_KEY" | "APERTURE_OWNER_EMAIL" | "STRAVA_CLIENT_ID" | "STRAVA_CLIENT_SECRET" | "STRAVA_REDIRECT_URI";
export interface WebEnvironmentInventory { readonly publicVariables: readonly PublicWebEnvironmentVariable[]; readonly serverOnlyVariables: readonly ServerWebEnvironmentVariable[]; }
export declare function describeWebEnvironment(): WebEnvironmentInventory;
