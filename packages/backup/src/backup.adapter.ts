import type { BackupCollection, BackupFeaturePayload, BackupIssue, BackupMetadata, BackupUnitContext } from "./backup.types.js";

export interface BackupRecordIdentity {
  readonly collection: string;
  readonly recordId: string;
  readonly fingerprint?: string;
}

export interface BackupFeatureAdapter {
  readonly featureId: string;
  readonly schemaVersion: number;
  export(ownerId: string): Promise<readonly BackupCollection[]>;
  validate(ownerId: string, payload: BackupFeaturePayload): Promise<readonly BackupIssue[]>;
  migrate?(payload: BackupFeaturePayload): Promise<BackupFeaturePayload>;
  listRecordIdentities(ownerId: string): Promise<readonly BackupRecordIdentity[]>;
  replace(ownerId: string, payload: BackupFeaturePayload): Promise<void>;
  merge(ownerId: string, payload: BackupFeaturePayload): Promise<void>;
  deleteAll(ownerId: string): Promise<void>;
}

export interface BackupTransactionRunner {
  run<TResult>(work: (adapters: readonly BackupFeatureAdapter[]) => Promise<TResult>): Promise<TResult>;
}

export interface BackupMetadataRepository {
  record(metadata: BackupMetadata): Promise<void>;
}

export interface BackupServiceDependencies {
  readonly adapters: readonly BackupFeatureAdapter[];
  readonly transactionRunner: BackupTransactionRunner;
  readonly clock: { now(): string };
  readonly idGenerator: { generate(): string };
  readonly readUnits?: (ownerId: string) => Promise<BackupUnitContext>;
  readonly metadataRepository?: BackupMetadataRepository;
}
