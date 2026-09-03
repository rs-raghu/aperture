export type MobileApplicationStatus = "structural_only";
export interface MobileApplicationDescriptor { readonly name: "Aperture Mobile"; readonly status: MobileApplicationStatus; readonly runnable: false; }
export declare function describeMobileApplication(): MobileApplicationDescriptor;
