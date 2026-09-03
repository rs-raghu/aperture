import type { FeatureId } from "./feature.types.js";

export interface FeatureCapabilityDescriptor {
  readonly id: string;
  readonly featureId: FeatureId;
  readonly description: string;
  readonly status: "planned" | "available" | "unavailable";
}
