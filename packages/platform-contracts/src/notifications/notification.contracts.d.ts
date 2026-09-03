import type {
  CreateNotificationInput,
  Notification,
  NotificationId,
  NotificationListQuery
} from "./notification.types.js";
import type { PlatformOwnerId } from "../platform.types.js";

export declare function createNotification(input: CreateNotificationInput): Promise<Notification>;
export declare function markNotificationRead(id: NotificationId): Promise<Notification>;
export declare function dismissNotification(id: NotificationId): Promise<Notification>;
export declare function listNotifications(
  query: NotificationListQuery
): Promise<readonly Notification[]>;
export declare function getUnreadNotificationCount(ownerId: PlatformOwnerId): Promise<number>;
