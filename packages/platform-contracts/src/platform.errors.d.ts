export type PlatformErrorCode =
  | "authentication"
  | "authorization"
  | "configuration"
  | "conflict"
  | "not-found"
  | "unavailable"
  | "unknown";

export interface PlatformError {
  readonly code: PlatformErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}
