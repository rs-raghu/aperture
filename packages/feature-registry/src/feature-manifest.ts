export type FeaturePlatform = "web" | "mobile";
export type FeatureStatus = "planned" | "enabled" | "disabled";
export type FeatureNavigationKind = "primary" | "secondary" | "hidden";

export interface FeaturePermissionManifest {
  readonly id: string;
  readonly description: string;
  readonly required: boolean;
}

export interface FeatureRouteManifest {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly paths: Readonly<Record<FeaturePlatform, string>>;
  readonly navigation: FeatureNavigationKind;
  readonly order: number;
  readonly searchable: boolean;
  readonly requiresSession: boolean;
}

export interface FeatureWidgetManifest {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly platforms: readonly FeaturePlatform[];
  readonly order: number;
  readonly defaultEnabled: boolean;
}

export interface FeatureModuleReference {
  readonly source: string;
  readonly import: string;
}

export interface CalculatorModuleManifest extends FeatureModuleReference {
  readonly id: string;
}

export interface FeatureManifest {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly version: string;
  readonly status: FeatureStatus;
  readonly defaultEnabled: boolean;
  readonly disableAllowed: boolean;
  readonly order: number;
  readonly icon: string;
  readonly theme: {
    readonly accent: string;
    readonly surface: string;
  };
  readonly permissions: readonly FeaturePermissionManifest[];
  readonly routes: readonly FeatureRouteManifest[];
  readonly widgets: readonly FeatureWidgetManifest[];
  readonly calculatorModules: readonly CalculatorModuleManifest[];
  readonly frontends: Readonly<Partial<Record<FeaturePlatform, FeatureModuleReference>>>;
  readonly backend?: FeatureModuleReference;
  readonly migrations: readonly string[];
}

export type FeatureEnablementOverrides = Readonly<Record<string, boolean | undefined>>;

export interface FeatureNavigationItem {
  readonly id: string;
  readonly featureId: string;
  readonly label: string;
  readonly description: string;
  readonly path: string;
  readonly icon: string;
  readonly order: number;
}

export interface FeatureSearchResult extends FeatureNavigationItem {
  readonly featureName: string;
  readonly keywords: string;
}

export interface FeatureWidgetContribution extends FeatureWidgetManifest {
  readonly featureId: string;
  readonly featureName: string;
}
