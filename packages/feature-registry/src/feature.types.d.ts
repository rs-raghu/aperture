export type FeatureId =
  | "today"
  | "education"
  | "health"
  | "finance"
  | "calculators"
  | "settings";

export type FeatureStatus = "planned" | "enabled" | "disabled";

export interface FeatureDescriptor {
  readonly id: FeatureId;
  readonly displayName: string;
  readonly description: string;
  readonly status: FeatureStatus;
  readonly routes: readonly string[];
  readonly navigationItemIds: readonly string[];
  readonly capabilities: readonly string[];
}
