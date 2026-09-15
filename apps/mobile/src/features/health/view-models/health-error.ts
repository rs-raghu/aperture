import { HealthApplicationError } from "@aperture/health";
import { HealthMemoryRepositoryError } from "@aperture/health-memory";

export interface HealthMobileError {
  readonly message: string;
  readonly fieldErrors: Readonly<Record<string, string>>;
}

interface IssueLike { readonly path?: readonly PropertyKey[]; readonly message?: string }

function issuesFrom(error: unknown): readonly IssueLike[] {
  if (error instanceof HealthApplicationError) return error.details.issues ?? [];
  if (typeof error !== "object" || error === null || !("issues" in error)) return [];
  return Array.isArray(error.issues) ? error.issues as readonly IssueLike[] : [];
}

export function normalizeHealthMobileError(error: unknown): HealthMobileError {
  const issues = issuesFrom(error);
  if (issues.length) {
    const fieldErrors = Object.fromEntries(issues.flatMap((issue) => {
      const field = issue.path?.[0];
      return typeof field === "string" && typeof issue.message === "string" ? [[field, issue.message]] : [];
    }));
    return { message: issues.map((issue) => issue.message).filter(Boolean).join(" ") || "Check the highlighted fields.", fieldErrors };
  }
  if (error instanceof HealthApplicationError) return { message: error.message, fieldErrors: {} };
  if (error instanceof HealthMemoryRepositoryError) return { message: "The local Health preview could not save that change. Reload and try again.", fieldErrors: {} };
  return { message: "An unexpected Health error occurred.", fieldErrors: {} };
}
