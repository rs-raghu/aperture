import type { ValidationIssue } from "@aperture/validation";

export const healthApplicationErrorCodes = [
  "health-validation-failed",
  "health-record-not-found",
  "health-parent-not-found",
  "health-owner-mismatch",
  "health-invalid-state-transition",
  "health-conflict",
  "health-repository-contract-violation",
] as const;

export type HealthApplicationErrorCode = typeof healthApplicationErrorCodes[number];

export interface HealthApplicationErrorDetails {
  readonly entityType?: string;
  readonly entityId?: string;
  readonly fromState?: string;
  readonly toState?: string;
  readonly issues?: readonly ValidationIssue[];
}

export class HealthApplicationError extends Error {
  public readonly name = "HealthApplicationError";

  public constructor(
    public readonly code: HealthApplicationErrorCode,
    message: string,
    public readonly details: HealthApplicationErrorDetails = {},
  ) {
    super(message);
  }
}
