import type { PlatformOwnerId } from "../platform.types.js";
import type { UserPreferences, UserPreferenceUpdate } from "./preference.types.js";

export declare function getUserPreferences(ownerId: PlatformOwnerId): Promise<UserPreferences>;
export declare function updateUserPreferences(
  ownerId: PlatformOwnerId,
  input: UserPreferenceUpdate
): Promise<UserPreferences>;
export declare function resetUserPreferences(ownerId: PlatformOwnerId): Promise<UserPreferences>;
