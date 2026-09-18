import { FinanceApplicationError } from "@aperture/finance";
import { FinanceMemoryRepositoryError } from "@aperture/finance-memory";

export interface FinanceUiError {
  readonly message: string;
  readonly fieldErrors: Readonly<Record<string, string>>;
}

interface IssueLike { readonly path?: readonly PropertyKey[]; readonly message?: string }

function issuesFrom(value: unknown): readonly IssueLike[] {
  if (typeof value !== "object" || value === null || !("issues" in value)) return [];
  const issues = (value as { readonly issues?: unknown }).issues;
  return Array.isArray(issues) ? issues as readonly IssueLike[] : [];
}

export function normalizeFinanceUiError(error: unknown): FinanceUiError {
  const issues = error instanceof FinanceApplicationError ? issuesFrom({ issues: error.details.issues }) : issuesFrom(error);
  if (issues.length > 0) return {
    message: issues.map(({ message }) => message).filter(Boolean).join(" ") || "Check the highlighted fields.",
    fieldErrors: Object.fromEntries(issues.flatMap((issue) => typeof issue.path?.[0] === "string" && issue.message ? [[issue.path[0], issue.message]] : [])),
  };
  if (error instanceof FinanceApplicationError) return { message: error.message, fieldErrors: {} };
  if (error instanceof FinanceMemoryRepositoryError) return { message: "The local Finance preview could not save that change. Reload and try again.", fieldErrors: {} };
  return { message: error instanceof Error && error.message ? error.message : "An unexpected Finance error occurred.", fieldErrors: {} };
}
