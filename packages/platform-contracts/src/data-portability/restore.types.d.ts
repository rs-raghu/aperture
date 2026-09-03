import type { BackupReference } from "./backup.types.js";
import type { PlatformOwnerId } from "../platform.types.js";

export type RestoreRequestId = string;

export interface RestoreBackupInput {
  readonly ownerId: PlatformOwnerId;
  readonly backup: BackupReference;
}

export interface RestoreRequest {
  readonly id: RestoreRequestId;
  readonly ownerId: PlatformOwnerId;
  readonly status: "requested" | "validating" | "ready" | "rejected";
}
