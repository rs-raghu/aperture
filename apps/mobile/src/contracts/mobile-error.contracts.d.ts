export interface MobileApplicationError { readonly code: string; readonly message: string; readonly cause?: unknown; }
export declare function normalizeMobileApplicationError(error: unknown): MobileApplicationError;
