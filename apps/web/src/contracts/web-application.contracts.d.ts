export type WebApplicationStatus = "structural_only";
export interface WebApplicationDescriptor { readonly name: "Aperture Web"; readonly status: WebApplicationStatus; readonly runnable: false; }
export declare function describeWebApplication(): WebApplicationDescriptor;
