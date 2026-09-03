export type MobileRoutePath = "/sign-in" | "/recover-password" | "/update-password" | "/today" | "/education" | "/health" | "/finance" | "/calculators" | "/settings";
export type MobileRouteGroup = "auth" | "tabs";
export interface MobileRouteDescriptor { readonly path: MobileRoutePath; readonly group: MobileRouteGroup; readonly implemented: false; }
export declare function listMobileRouteInventory(): readonly MobileRouteDescriptor[];
