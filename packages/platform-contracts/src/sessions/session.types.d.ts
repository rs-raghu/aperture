import type { IsoDateTimeString } from "../platform.types.js";
import type { UserId } from "../users/user.types.js";

export type SessionId = string;

export interface PlatformSession {
  readonly id: SessionId;
  readonly userId: UserId;
  readonly expiresAt: IsoDateTimeString;
  readonly refreshedAt?: IsoDateTimeString;
}
