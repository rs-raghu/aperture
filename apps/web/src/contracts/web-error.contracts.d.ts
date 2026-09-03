export interface WebApplicationError { readonly code: string; readonly message: string; readonly cause?: unknown; }
export declare function normalizeWebApplicationError(error: unknown): WebApplicationError;
