import type { FeatureCapabilityDescriptor } from "./feature-capability.types.js";
import type { FeatureNavigationDescriptor } from "./feature-navigation.types.js";
import type { FeatureRouteDescriptor } from "./feature-route.types.js";
import type { FeatureDescriptor, FeatureId } from "./feature.types.js";

export declare function registerFeature(feature: FeatureDescriptor): Promise<void>;
export declare function getFeature(id: FeatureId): Promise<FeatureDescriptor | null>;
export declare function listFeatures(): Promise<readonly FeatureDescriptor[]>;
export declare function listEnabledFeatures(): Promise<readonly FeatureDescriptor[]>;
export declare function getFeatureRoutes(
  id: FeatureId
): Promise<readonly FeatureRouteDescriptor[]>;
export declare function getFeatureNavigation(
  id: FeatureId
): Promise<readonly FeatureNavigationDescriptor[]>;
export declare function getFeatureCapabilities(
  id: FeatureId
): Promise<readonly FeatureCapabilityDescriptor[]>;
