import type { IsoDateTimeString, PlatformOwnerId } from "../platform.types.js";

export type SynchronizationEventId = string;
export type SynchronizationScope = "education" | "health" | "finance" | "platform";
export type SynchronizationState = "idle" | "requested" | "running" | "succeeded" | "failed";

export interface SynchronizationStatus {
  readonly ownerId: PlatformOwnerId;
  readonly scope: SynchronizationScope;
  readonly state: SynchronizationState;
  readonly lastSucceededAt?: IsoDateTimeString;
  readonly lastFailedAt?: IsoDateTimeString;
}

export interface SynchronizationRequest {
  readonly ownerId: PlatformOwnerId;
  readonly scope: SynchronizationScope;
}

export interface SynchronizationEvent {
  readonly id: SynchronizationEventId;
  readonly ownerId: PlatformOwnerId;
  readonly scope: SynchronizationScope;
  readonly state: SynchronizationState;
  readonly occurredAt: IsoDateTimeString;
  readonly errorCode?: string;
}

export interface SynchronizationEventQuery {
  readonly ownerId: PlatformOwnerId;
  readonly scope?: SynchronizationScope;
}
