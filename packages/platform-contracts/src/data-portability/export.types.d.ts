import type { IsoDateTimeString, PlatformOwnerId } from "../platform.types.js";

export type DataExportId = string;
export type DataExportFormat = "json";

export interface ExportUserDataInput {
  readonly ownerId: PlatformOwnerId;
  readonly format: DataExportFormat;
}

export interface DataExportDescriptor {
  readonly id: DataExportId;
  readonly ownerId: PlatformOwnerId;
  readonly format: DataExportFormat;
  readonly requestedAt: IsoDateTimeString;
  readonly expiresAt?: IsoDateTimeString;
}
