import type { WebRoutePath } from "./web-route.contracts.js";
export interface WebNavigationItem { readonly id: string; readonly label: string; readonly route: WebRoutePath; }
export declare function getWebNavigationInventory(): readonly WebNavigationItem[];
