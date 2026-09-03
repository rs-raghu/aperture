export interface WebSessionProjection { readonly sessionId: string; readonly userId: string; readonly expiresAt: string; }
export declare function getWebSessionProjection(): Promise<WebSessionProjection | null>;
