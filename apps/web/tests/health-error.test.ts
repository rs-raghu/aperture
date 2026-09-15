import { describe, expect, it } from "vitest";
import { HealthMemoryRepositoryError } from "@aperture/health-memory";
import { normalizeHealthUiError } from "@/features/health/view-models/health-error";

describe("Health UI error normalization", () => {
  it("preserves readable issue messages and field paths", () => {
    const result = normalizeHealthUiError({ issues: [{ path: ["volume"], message: "Enter a positive volume." }] });
    expect(result.fieldErrors.volume).toBe("Enter a positive volume.");
    expect(result.message).toBe("Enter a positive volume.");
    expect(result.message).not.toContain("[object Object]");
  });

  it("does not expose object stringification for unknown values", () => {
    expect(normalizeHealthUiError({ private: true }).message).toBe("An unexpected Health error occurred.");
  });

  it("normalizes repository failures without exposing adapter details", () => {
    const error = new HealthMemoryRepositoryError("health-memory-record-not-found", "private adapter detail");
    expect(normalizeHealthUiError(error)).toEqual({
      message: "The local Health preview could not save that change. Reload and try again.",
      fieldErrors: {},
    });
  });
});
