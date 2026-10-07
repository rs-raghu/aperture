export const BACKUP_FORMAT = "aperture-backup" as const;
export const BACKUP_SCHEMA_VERSION = 2 as const;
export const BACKUP_PRIVACY_WARNING = "Privacy warning: this plaintext Aperture backup contains personal data. Store it securely and delete copies you no longer need.";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
export interface JsonObject { readonly [key: string]: JsonValue; }

export interface BackupCollection {
  readonly name: string;
  readonly records: readonly JsonObject[];
}

export interface BackupFeaturePayload {
  readonly featureId: string;
  readonly schemaVersion: number;
  readonly collections: readonly BackupCollection[];
}

export interface BackupScope {
  readonly kind: "full" | "features";
  readonly featureIds: readonly string[];
}

export interface BackupUnitContext {
  readonly currency?: string;
  readonly measurementSystem?: string;
  readonly temperatureUnit?: string;
  readonly distanceUnit?: string;
  readonly massUnit?: string;
}

export interface BackupIntegrity {
  readonly algorithm: "fnv1a-64";
  readonly digest: string;
}

export interface ApertureBackup {
  readonly format: typeof BACKUP_FORMAT;
  readonly schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  readonly backupId: string;
  readonly ownerId: string;
  readonly exportedAt: string;
  readonly scope: BackupScope;
  readonly units: BackupUnitContext;
  readonly privacyWarning: string;
  readonly features: readonly BackupFeaturePayload[];
  readonly recordCount: number;
  readonly integrity: BackupIntegrity;
}

export interface LegacyApertureBackupV1 {
  readonly format: typeof BACKUP_FORMAT;
  readonly schemaVersion: 1;
  readonly backupId: string;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly domains: readonly BackupFeaturePayload[];
  readonly units?: BackupUnitContext;
  readonly integrity: BackupIntegrity;
}

export type BackupIssueCode =
  | "backup-invalid-json"
  | "backup-invalid-shape"
  | "backup-unsupported-version"
  | "backup-checksum-mismatch"
  | "backup-owner-mismatch"
  | "backup-unknown-feature"
  | "backup-invalid-feature"
  | "backup-duplicate-record"
  | "backup-conflict";

export interface BackupIssue {
  readonly code: BackupIssueCode;
  readonly message: string;
  readonly featureId?: string;
  readonly collection?: string;
  readonly recordId?: string;
}

export interface BackupValidationResult {
  readonly valid: boolean;
  readonly backup?: ApertureBackup;
  readonly issues: readonly BackupIssue[];
  readonly migratedFromVersion?: number;
}

export interface BackupConflict {
  readonly featureId: string;
  readonly collection: string;
  readonly recordId: string;
  readonly kind: "existing-record" | "duplicate-backup-record";
}

export interface RestorePreview {
  readonly valid: boolean;
  readonly mode: "merge" | "replace";
  readonly backup?: ApertureBackup;
  readonly issues: readonly BackupIssue[];
  readonly conflicts: readonly BackupConflict[];
  readonly additions: number;
  readonly replacements: number;
  readonly deletions: number;
  readonly stateChecksum: string;
  readonly confirmation: string;
}

export interface RestoreResult {
  readonly backupId: string;
  readonly restoredAt: string;
  readonly recordCount: number;
  readonly featureIds: readonly string[];
}

export interface DeletionPreview {
  readonly ownerId: string;
  readonly featureIds: readonly string[];
  readonly recordCount: number;
  readonly stateChecksum: string;
  readonly confirmation: string;
}

export interface BackupMetadata {
  readonly backupId: string;
  readonly ownerId: string;
  readonly schemaVersion: number;
  readonly exportedAt: string;
  readonly scope: BackupScope;
  readonly recordCount: number;
  readonly checksum: string;
}
