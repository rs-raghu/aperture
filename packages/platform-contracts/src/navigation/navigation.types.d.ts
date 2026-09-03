export type NavigationPlatform = "web" | "mobile";
export type NavigationItemId = string;
export type NavigationRoute = string;

export interface NavigationItem {
  readonly id: NavigationItemId;
  readonly platform: NavigationPlatform;
  readonly label: string;
  readonly route: NavigationRoute;
  readonly parentId?: NavigationItemId;
  readonly order: number;
  readonly requiredCapability?: string;
}

export interface RouteAccessibilityInput {
  readonly route: NavigationRoute;
  readonly ownerId?: string;
  readonly capabilities?: readonly string[];
}

export interface RouteAccessibilityResult {
  readonly route: NavigationRoute;
  readonly accessible: boolean;
  readonly reason?: string;
}
