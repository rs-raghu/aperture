import type {
  FeatureEnablementOverrides,
  FeatureManifest,
  FeatureNavigationItem,
  FeaturePlatform,
  FeatureRouteManifest,
  FeatureSearchResult,
  FeatureWidgetContribution,
} from "./feature-manifest.js";

export class FeatureRegistryValidationError extends Error {
  public constructor(public readonly issues: readonly string[]) {
    super(`Feature registry validation failed:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
    this.name = "FeatureRegistryValidationError";
  }
}

function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

function duplicateIssues(values: readonly string[], label: string): readonly string[] {
  return duplicates(values).map((value) => `Duplicate ${label}: ${value}`);
}

export function validateFeatureManifests(manifests: readonly FeatureManifest[]): void {
  const issues: string[] = [];
  if (manifests.length === 0) issues.push("At least one feature manifest is required.");
  issues.push(...duplicateIssues(manifests.map(({ id }) => id), "feature ID"));
  issues.push(...duplicateIssues(manifests.flatMap(({ routes }) => routes.map(({ id }) => id)), "route ID"));
  issues.push(...duplicateIssues(manifests.flatMap(({ permissions }) => permissions.map(({ id }) => id)), "permission ID"));
  issues.push(...duplicateIssues(manifests.flatMap(({ widgets }) => widgets.map(({ id }) => id)), "widget ID"));
  issues.push(...duplicateIssues(manifests.flatMap(({ calculatorModules }) => calculatorModules.map(({ id }) => id)), "calculator module ID"));
  issues.push(...duplicateIssues(manifests.flatMap(({ migrations }) => migrations), "migration path"));
  for (const platform of ["web", "mobile"] as const) {
    issues.push(...duplicateIssues(manifests.flatMap(({ routes }) => routes.map(({ paths }) => paths[platform])), `${platform} route path`));
  }
  for (const manifest of manifests) {
    const primaryRoutes = manifest.routes.filter(({ navigation }) => navigation === "primary");
    if (primaryRoutes.length !== 1) issues.push(`Feature ${manifest.id} must declare exactly one primary route.`);
    if (!manifest.disableAllowed && !manifest.defaultEnabled) issues.push(`Required feature ${manifest.id} must be enabled by default.`);
    if (manifest.status === "enabled" && manifest.routes.length === 0) issues.push(`Enabled feature ${manifest.id} must declare a route.`);
    for (const route of manifest.routes) {
      for (const platform of ["web", "mobile"] as const) {
        if (!route.paths[platform].startsWith("/")) issues.push(`Route ${route.id} has an invalid ${platform} path.`);
      }
    }
  }
  if (issues.length > 0) throw new FeatureRegistryValidationError(issues);
}

function routeMatchesPath(route: FeatureRouteManifest, platform: FeaturePlatform, path: string): boolean {
  const routeSegments = route.paths[platform].split("/").filter(Boolean);
  const pathSegments = path.split(/[?#]/, 1)[0]!.split("/").filter(Boolean);
  if (routeSegments.length !== pathSegments.length) return false;
  return routeSegments.every((segment, index) => segment.startsWith("[") && segment.endsWith("]") || segment === pathSegments[index]);
}

function isEnabled(manifest: FeatureManifest, overrides: FeatureEnablementOverrides): boolean {
  if (manifest.status === "disabled") return false;
  if (!manifest.disableAllowed) return true;
  return overrides[manifest.id] ?? manifest.defaultEnabled;
}

function navigationItem(manifest: FeatureManifest, route: FeatureRouteManifest, platform: FeaturePlatform): FeatureNavigationItem {
  return Object.freeze({
    id: route.id,
    featureId: manifest.id,
    label: route.label,
    description: route.description,
    path: route.paths[platform],
    icon: manifest.icon,
    order: route.order,
  });
}

export class FeatureRegistry {
  readonly #manifests: readonly FeatureManifest[];

  public constructor(manifests: readonly FeatureManifest[]) {
    validateFeatureManifests(manifests);
    this.#manifests = Object.freeze([...manifests].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id)));
  }

  public listFeatures(): readonly FeatureManifest[] {
    return this.#manifests;
  }

  public getFeature(id: string): FeatureManifest | undefined {
    return this.#manifests.find((manifest) => manifest.id === id);
  }

  public listEnabled(overrides: FeatureEnablementOverrides = {}): readonly FeatureManifest[] {
    return this.#manifests.filter((manifest) => isEnabled(manifest, overrides));
  }

  public isEnabled(id: string, overrides: FeatureEnablementOverrides = {}): boolean {
    const manifest = this.getFeature(id);
    return manifest !== undefined && isEnabled(manifest, overrides);
  }

  public navigation(platform: FeaturePlatform, overrides: FeatureEnablementOverrides = {}): readonly FeatureNavigationItem[] {
    return this.listEnabled(overrides).flatMap((manifest) => manifest.routes
      .filter(({ navigation }) => navigation === "primary")
      .map((route) => Object.freeze({ ...navigationItem(manifest, route, platform), label: manifest.displayName })))
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  }

  public secondaryNavigation(featureId: string, platform: FeaturePlatform): readonly FeatureNavigationItem[] {
    const manifest = this.getFeature(featureId);
    if (!manifest) return [];
    return manifest.routes.filter(({ navigation }) => navigation !== "hidden")
      .map((route) => navigationItem(manifest, route, platform))
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  }

  public widgets(platform: FeaturePlatform, overrides: FeatureEnablementOverrides = {}): readonly FeatureWidgetContribution[] {
    return this.listEnabled(overrides).flatMap((manifest) => manifest.widgets
      .filter(({ platforms }) => platforms.includes(platform))
      .map((widget) => Object.freeze({ ...widget, featureId: manifest.id, featureName: manifest.displayName })))
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  }

  public findRoute(platform: FeaturePlatform, path: string): FeatureSearchResult | undefined {
    for (const manifest of this.#manifests) {
      const route = manifest.routes.find((candidate) => routeMatchesPath(candidate, platform, path));
      if (route) return this.searchResult(manifest, route, platform);
    }
    return undefined;
  }

  public search(query: string, platform: FeaturePlatform, overrides: FeatureEnablementOverrides = {}): readonly FeatureSearchResult[] {
    const normalized = query.trim().toLocaleLowerCase();
    return this.listEnabled(overrides).flatMap((manifest) => manifest.routes
      .filter(({ searchable }) => searchable)
      .map((route) => this.searchResult(manifest, route, platform)))
      .filter((result) => normalized === "" || result.keywords.includes(normalized))
      .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label));
  }

  private searchResult(manifest: FeatureManifest, route: FeatureRouteManifest, platform: FeaturePlatform): FeatureSearchResult {
    return Object.freeze({
      ...navigationItem(manifest, route, platform),
      featureName: manifest.displayName,
      keywords: `${route.label} ${route.description} ${manifest.displayName} ${manifest.description}`.toLocaleLowerCase(),
    });
  }
}

export function createFeatureRegistry(manifests: readonly FeatureManifest[]): FeatureRegistry {
  return new FeatureRegistry(manifests);
}
