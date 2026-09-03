import type { MobileRoutePath } from "./mobile-route.contracts.js";
export interface MobileNavigationItem { readonly id: string; readonly label: string; readonly route: MobileRoutePath; }
export declare function getMobileNavigationInventory(): readonly MobileNavigationItem[];
