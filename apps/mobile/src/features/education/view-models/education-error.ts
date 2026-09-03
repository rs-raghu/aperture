import { EducationApplicationError } from "@aperture/education";
import { EducationMemoryRepositoryError } from "@aperture/education-memory";

export interface EducationMobileError {
  readonly message: string;
  readonly fieldErrors: Readonly<Record<string, string>>;
}

function readableMessage(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== "[object Object]" ? trimmed : undefined;
}

export function normalizeEducationMobileError(error: unknown): EducationMobileError {
  if (
    error instanceof EducationApplicationError ||
    error instanceof EducationMemoryRepositoryError
  ) {
    return {
      message: readableMessage(error.message) ?? "The Education operation could not be completed.",
      fieldErrors: {},
    };
  }

  if (typeof error === "object" && error !== null && "issues" in error && Array.isArray(error.issues)) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      if (typeof issue !== "object" || issue === null) continue;
      const message = "message" in issue ? readableMessage(issue.message) : undefined;
      const path = "path" in issue && Array.isArray(issue.path) ? issue.path : [];
      const field = path.length > 0 ? String(path[0]) : "";
      if (message && field && fieldErrors[field] === undefined) fieldErrors[field] = message;
    }
    return {
      message: Object.values(fieldErrors)[0] ?? "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  if (error instanceof Error) {
    return {
      message: readableMessage(error.message) ?? "An unexpected Education error occurred.",
      fieldErrors: {},
    };
  }

  return { message: "An unexpected Education error occurred.", fieldErrors: {} };
}
