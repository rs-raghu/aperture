export const educationMemoryRepositoryErrorCodes = [
  "education-memory-duplicate-id",
  "education-memory-record-not-found",
  "education-memory-immutable-identity",
  "education-memory-invalid-query",
] as const;

export type EducationMemoryRepositoryErrorCode =
  (typeof educationMemoryRepositoryErrorCodes)[number];

export interface EducationMemoryRepositoryErrorDetails {
  readonly entityId?: string;
  readonly field?: string;
}

export class EducationMemoryRepositoryError extends Error {
  public readonly name = "EducationMemoryRepositoryError";
  public readonly entityId: string | undefined;
  public readonly field: string | undefined;

  public constructor(
    public readonly code: EducationMemoryRepositoryErrorCode,
    message: string,
    details: EducationMemoryRepositoryErrorDetails = {},
  ) {
    super(message);
    this.entityId = details.entityId;
    this.field = details.field;
  }
}
