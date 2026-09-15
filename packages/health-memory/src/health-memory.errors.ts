export const healthMemoryRepositoryErrorCodes = [
  "health-memory-duplicate-id",
  "health-memory-record-not-found",
  "health-memory-immutable-identity",
  "health-memory-invalid-query",
  "health-memory-owner-conflict",
] as const;

export type HealthMemoryRepositoryErrorCode =
  (typeof healthMemoryRepositoryErrorCodes)[number];

export interface HealthMemoryRepositoryErrorDetails {
  readonly entityId?: string;
  readonly field?: string;
}

export class HealthMemoryRepositoryError extends Error {
  public readonly name = "HealthMemoryRepositoryError";
  public readonly entityId: string | undefined;
  public readonly field: string | undefined;

  public constructor(
    public readonly code: HealthMemoryRepositoryErrorCode,
    message: string,
    details: HealthMemoryRepositoryErrorDetails = {},
  ) {
    super(message);
    this.entityId = details.entityId;
    this.field = details.field;
  }
}
