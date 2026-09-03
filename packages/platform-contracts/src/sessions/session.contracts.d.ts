import type { PlatformSession, SessionId } from "./session.types.js";

export declare function getSession(sessionId: SessionId): Promise<PlatformSession | null>;
export declare function revokeSession(sessionId: SessionId): Promise<void>;
export declare function listUserSessions(): Promise<readonly PlatformSession[]>;
