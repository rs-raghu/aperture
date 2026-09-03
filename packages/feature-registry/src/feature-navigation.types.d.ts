import type { FeatureId } from "./feature.types.js";

export interface FeatureNavigationDescriptor {
  readonly id: string;
  readonly featureId: FeatureId;
  readonly platform: "web" | "mobile";
  readonly label: string;
  readonly route: string;
  readonly order: number;
}
