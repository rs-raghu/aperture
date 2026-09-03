import type { PlatformUser, UpdateUserProfileInput, UserId } from "./user.types.js";

export declare function getUser(userId: UserId): Promise<PlatformUser | null>;
export declare function updateUserProfile(
  userId: UserId,
  input: UpdateUserProfileInput
): Promise<PlatformUser>;
