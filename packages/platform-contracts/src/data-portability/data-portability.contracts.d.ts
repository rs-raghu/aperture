import type { PlatformOwnerId } from "../platform.types.js";
import type { BackupMetadata, BackupReference, BackupValidationResult } from "./backup.types.js";
import type { DataExportDescriptor, ExportUserDataInput } from "./export.types.js";
import type { RestoreBackupInput, RestoreRequest } from "./restore.types.js";

export declare function exportUserData(input: ExportUserDataInput): Promise<DataExportDescriptor>;
export declare function validateBackup(backup: BackupReference): Promise<BackupValidationResult>;
export declare function restoreBackup(input: RestoreBackupInput): Promise<RestoreRequest>;
export declare function getBackupMetadata(backup: BackupReference): Promise<BackupMetadata>;
export declare function deleteUserData(ownerId: PlatformOwnerId): Promise<void>;
export declare function requestAccountDeletion(ownerId: PlatformOwnerId): Promise<void>;
