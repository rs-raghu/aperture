import type { IsoDateTimeString, PlatformOwnerId } from "../platform.types.js";

export type BackupId = string;
export type BackupSchemaVersion = string;

export interface BackupReference {
  readonly source: unknown;
}

export interface BackupMetadata {
  readonly id: BackupId;
  readonly ownerId: PlatformOwnerId;
  readonly schemaVersion: BackupSchemaVersion;
  readonly createdAt: IsoDateTimeString;
  readonly includedDomains: readonly string[];
}

export interface BackupValidationResult {
  readonly valid: boolean;
  readonly metadata?: BackupMetadata;
  readonly issues: readonly string[];
}
