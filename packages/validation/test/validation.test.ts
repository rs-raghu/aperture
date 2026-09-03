import { describe, expect, it } from "vitest";

import {
  isValidationFailure,
  isValidationSuccess,
  normalizeValidationError,
  validateInput,
  validateOutput,
  z,
} from "../src/index.js";

const exampleSchema = z.strictObject({
  title: z.string().min(1),
  count: z.number().int().nonnegative(),
});

describe("shared validation", () => {
  it("returns a typed success for valid input", () => {
    const result = validateInput(exampleSchema, { title: "Synthetic", count: 1 });

    expect(isValidationSuccess(result)).toBe(true);
    if (isValidationSuccess(result)) {
      expect(result.value.title).toBe("Synthetic");
    }
  });

  it("preserves paths and readable messages for invalid input", () => {
    const result = validateInput(exampleSchema, { title: "", count: -1 });

    expect(isValidationFailure(result)).toBe(true);
    if (isValidationFailure(result)) {
      expect(result.issues.map((issue) => issue.path[0])).toEqual(["title", "count"]);
      expect(result.issues.every((issue) => issue.message.length > 0)).toBe(true);
    }
  });

  it("validates output through the same narrow schema contract", () => {
    expect(validateOutput(exampleSchema, { title: "Output", count: 0 }).success).toBe(true);
    expect(validateOutput(exampleSchema, { title: "Output", count: -1 }).success).toBe(false);
  });

  it("normalizes Zod errors without object-string coercion or stack traces", () => {
    const parsed = exampleSchema.safeParse({ title: "", count: -1 });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const normalized = normalizeValidationError(parsed.error);
    expect(normalized.name).toBe("ValidationError");
    expect(normalized.message).not.toContain("[object Object]");
    expect(Object.keys(normalized)).not.toContain("stack");
    expect(normalized.issues[0]?.path).toEqual(["title"]);
  });

  it("normalizes unknown values into a readable generic error", () => {
    const normalized = normalizeValidationError({ reason: "synthetic" });

    expect(normalized.message).toBe("Validation failed.");
    expect(normalized.message).not.toBe("[object Object]");
    expect(normalized.issues).toEqual([
      { code: "unknown", message: "Validation failed.", path: [] },
    ]);
  });
});
