import { HealthApplicationError } from "@aperture/health";
import { HealthMemoryRepositoryError } from "@aperture/health-memory";

export interface HealthUiError {
  readonly message: string;
  readonly fieldErrors: Readonly<Record<string, string>>;
}

interface IssueLike {
  readonly path?: readonly PropertyKey[];
  readonly message?: string;
}

function issueList(value: unknown): readonly IssueLike[] {
  if (typeof value !== "object" || value === null || !("issues" in value)) return [];
  const issues = (value as { readonly issues?: unknown }).issues;
  return Array.isArray(issues) ? issues as readonly IssueLike[] : [];
}

function fieldErrors(issues: readonly IssueLike[]): Readonly<Record<string, string>> {
  return Object.fromEntries(issues.flatMap((issue) => {
    const field = issue.path?.[0];
    return typeof field === "string" && typeof issue.message === "string" ? [[field, issue.message]] : [];
  }));
}

export function normalizeHealthUiError(error: unknown): HealthUiError {
  const nestedIssues = error instanceof HealthApplicationError ? error.details.issues ?? [] : issueList(error);
  if (nestedIssues.length > 0) {
    return {
      message: nestedIssues.map((issue) => issue.message).filter(Boolean).join(" ") || "Check the highlighted fields.",
      fieldErrors: fieldErrors(nestedIssues),
    };
  }
  if (error instanceof HealthApplicationError) return { message: error.message, fieldErrors: {} };
  if (error instanceof HealthMemoryRepositoryError) {
    return { message: "The local Health preview could not save that change. Reload and try again.", fieldErrors: {} };
  }
  return { message: "An unexpected Health error occurred.", fieldErrors: {} };
}
