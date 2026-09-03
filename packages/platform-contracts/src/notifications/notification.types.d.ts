import type { IsoDateTimeString, PlatformOwnerId } from "../platform.types.js";

export type NotificationId = string;
export type NotificationStatus = "unread" | "read" | "dismissed";
export type NotificationCategory = "education" | "health" | "finance" | "platform";

export interface Notification {
  readonly id: NotificationId;
  readonly ownerId: PlatformOwnerId;
  readonly category: NotificationCategory;
  readonly title: string;
  readonly message: string;
  readonly status: NotificationStatus;
  readonly createdAt: IsoDateTimeString;
  readonly readAt?: IsoDateTimeString;
  readonly dismissedAt?: IsoDateTimeString;
}

export interface CreateNotificationInput {
  readonly ownerId: PlatformOwnerId;
  readonly category: NotificationCategory;
  readonly title: string;
  readonly message: string;
}

export interface NotificationListQuery {
  readonly ownerId: PlatformOwnerId;
  readonly status?: NotificationStatus;
}
