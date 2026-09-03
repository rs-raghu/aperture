import type { IsoDateTimeString, PlatformOwnerId } from "../platform.types.js";

export type IntegrationId = string;
export type IntegrationConnectionId = string;
export type IntegrationStatusValue = "available" | "connecting" | "connected" | "disconnected" | "error";

export interface IntegrationDescriptor {
  readonly id: IntegrationId;
  readonly displayName: string;
  readonly capabilities: readonly string[];
}

export interface IntegrationConnection {
  readonly id: IntegrationConnectionId;
  readonly integrationId: IntegrationId;
  readonly ownerId: PlatformOwnerId;
  readonly status: IntegrationStatusValue;
  readonly connectedAt?: IsoDateTimeString;
  readonly lastSynchronizedAt?: IsoDateTimeString;
  readonly lastErrorCode?: string;
}

export interface ConnectIntegrationInput {
  readonly ownerId: PlatformOwnerId;
  readonly integrationId: IntegrationId;
  readonly callbackUrl?: string;
}

export interface IntegrationListQuery {
  readonly ownerId: PlatformOwnerId;
}
