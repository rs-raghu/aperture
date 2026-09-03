export type EnvironmentClassification =
  | "local"
  | "development"
  | "preview"
  | "production"
  | "test";

export interface PublicWebConfiguration {
  readonly environment: EnvironmentClassification;
  readonly supabaseUrl: string;
  readonly supabasePublishableKey: string;
  readonly applicationOrigin: string;
}

export interface ServerOnlyWebConfiguration {
  readonly environment: EnvironmentClassification;
  readonly supabaseServiceRoleKey: string;
  readonly ownerEmail: string;
  readonly integrationCredentials: Readonly<Record<string, string>>;
}

export interface PublicMobileConfiguration {
  readonly environment: EnvironmentClassification;
  readonly supabaseUrl: string;
  readonly supabasePublishableKey: string;
  readonly applicationScheme: string;
}

export interface SupabasePublicConfiguration {
  readonly url: string;
  readonly publishableKey: string;
  readonly secretClassification: "public";
}

export interface SupabaseServerOnlyConfiguration {
  readonly url: string;
  readonly publishableKey: string;
  readonly serviceRoleKey: string;
  readonly secretClassification: "server-only";
}

export type SupabaseConfiguration =
  | SupabasePublicConfiguration
  | SupabaseServerOnlyConfiguration;

export interface FeatureFlagConfiguration {
  readonly flags: Readonly<Record<string, boolean>>;
}

export interface IntegrationConfiguration {
  readonly integrationId: string;
  readonly enabled: boolean;
  readonly secretClassification: "server-only";
}

export interface ConfigurationValidationIssue {
  readonly variableName: string;
  readonly message: string;
}

export interface ConfigurationValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ConfigurationValidationIssue[];
}
