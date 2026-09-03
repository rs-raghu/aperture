export type PublicMobileEnvironmentVariable = "EXPO_PUBLIC_SUPABASE_URL" | "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | "EXPO_PUBLIC_APP_SCHEME";
export interface MobileEnvironmentInventory { readonly publicVariables: readonly PublicMobileEnvironmentVariable[]; readonly forbidsServerSecrets: true; }
export declare function describeMobileEnvironment(): MobileEnvironmentInventory;
