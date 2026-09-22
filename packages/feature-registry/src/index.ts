export * from "./feature-manifest.js";
export * from "./feature-registry.js";
export { generatedFeatureManifests } from "./feature-manifests.generated.js";

import { generatedFeatureManifests } from "./feature-manifests.generated.js";
import { createFeatureRegistry } from "./feature-registry.js";

export type FeatureId = (typeof generatedFeatureManifests)[number]["id"];
export const featureRegistry = createFeatureRegistry(generatedFeatureManifests);
