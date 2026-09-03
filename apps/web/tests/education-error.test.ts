import { describe, expect, it } from "vitest";
import { normalizeEducationUiError } from "@/features/education/view-models/education-error";

describe("Education UI error normalization", () => {
  it("preserves field paths and readable messages", () => {
    const result = normalizeEducationUiError({ issues: [{ path: ["credits"], message: "Expected a normalized decimal string." }] });
    expect(result.fieldErrors.credits).toBe("Expected a normalized decimal string.");
    expect(result.message).not.toBe("[object Object]");
  });

  it("does not expose object stringification for unknown values", () => {
    expect(normalizeEducationUiError({ private: true }).message).toBe("An unexpected Education error occurred.");
  });
});
