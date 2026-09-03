import type { FeatureId } from "./feature.types.js";

export type FeatureRoutePlatform = "web" | "mobile";

export interface FeatureRouteDescriptor {
  readonly featureId: FeatureId;
  readonly platform: FeatureRoutePlatform;
  readonly path: string;
  readonly requiresSession: boolean;
}
