import { normalizeHealthMobileError } from "../src/features/health";

describe("Health mobile error normalization", () => {
  it("maps issue paths to readable field errors", () => {
    const result = normalizeHealthMobileError({ issues: [{ path: ["volume"], message: "Enter a positive volume." }] });
    expect(result.fieldErrors.volume).toBe("Enter a positive volume.");
    expect(result.message).toBe("Enter a positive volume.");
    expect(result.message).not.toContain("[object Object]");
  });

  it("uses a safe message for unknown values", () => {
    expect(normalizeHealthMobileError({ secret: true }).message).toBe("An unexpected Health error occurred.");
  });
});
