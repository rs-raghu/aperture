import type { IsoDateTimeString, PlatformOwnerId } from "../platform.types.js";

export type UserId = string;

export interface PlatformUser {
  readonly id: UserId;
  readonly ownerId: PlatformOwnerId;
  readonly email: string;
  readonly displayName?: string;
  readonly createdAt: IsoDateTimeString;
  readonly updatedAt: IsoDateTimeString;
}

export interface UpdateUserProfileInput {
  readonly displayName?: string;
}
