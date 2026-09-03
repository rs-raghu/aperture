import { EducationApplicationError } from "@aperture/education";
import { normalizeEducationMobileError } from "../src/features/education";

describe("normalizeEducationMobileError", () => {
  it("preserves readable issue paths", () => {
    const result = normalizeEducationMobileError({ issues: [{ path: ["name"], message: "Name is required." }] });
    expect(result.fieldErrors.name).toBe("Name is required.");
    expect(result.message).toBe("Name is required.");
  });

  it("never renders object coercion or stack traces", () => {
    expect(normalizeEducationMobileError({ value: 1 }).message).not.toBe("[object Object]");
    expect(normalizeEducationMobileError(new Error("[object Object]")).message).toBe("An unexpected Education error occurred.");
  });

  it("normalizes typed application errors", () => {
    const error = new EducationApplicationError("education-conflict", "A safe conflict occurred.");
    expect(normalizeEducationMobileError(error).message).toBe("A safe conflict occurred.");
  });
});
