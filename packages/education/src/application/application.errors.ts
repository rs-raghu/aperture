import type { ValidationIssue } from "@aperture/validation";

export const educationApplicationErrorCodes = [
  "education-record-not-found",
  "education-parent-not-found",
  "education-owner-mismatch",
  "education-invalid-state-transition",
  "education-conflict",
  "education-related-records-exist",
  "education-validation-failed",
  "education-operation-failed",
] as const;

export type EducationApplicationErrorCode = (typeof educationApplicationErrorCodes)[number];

export interface EducationApplicationErrorDetails {
  readonly entityType?: string;
  readonly entityId?: string;
  readonly issues?: readonly ValidationIssue[];
}

export class EducationApplicationError extends Error {
  public readonly name = "EducationApplicationError";
  public readonly entityType: string | undefined;
  public readonly entityId: string | undefined;
  public readonly issues: readonly ValidationIssue[];

  public constructor(
    public readonly code: EducationApplicationErrorCode,
    message: string,
    details: EducationApplicationErrorDetails = {},
  ) {
    super(message);
    this.entityType = details.entityType;
    this.entityId = details.entityId;
    this.issues = details.issues ?? [];
  }
}
