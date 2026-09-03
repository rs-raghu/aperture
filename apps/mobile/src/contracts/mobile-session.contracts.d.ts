export interface MobileSessionProjection { readonly sessionId: string; readonly userId: string; readonly expiresAt: string; }
export declare function getMobileSessionProjection(): Promise<MobileSessionProjection | null>;
