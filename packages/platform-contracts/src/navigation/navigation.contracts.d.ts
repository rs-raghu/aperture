import type {
  NavigationItem,
  NavigationItemId,
  RouteAccessibilityInput,
  RouteAccessibilityResult
} from "./navigation.types.js";

export declare function getWebNavigation(): Promise<readonly NavigationItem[]>;
export declare function getMobileNavigation(): Promise<readonly NavigationItem[]>;
export declare function getNavigationItem(id: NavigationItemId): Promise<NavigationItem | null>;
export declare function listNavigationItems(): Promise<readonly NavigationItem[]>;
export declare function isRouteAccessible(
  input: RouteAccessibilityInput
): Promise<RouteAccessibilityResult>;
