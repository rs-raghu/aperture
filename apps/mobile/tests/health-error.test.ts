import { HealthMemoryRepositoryError } from "@aperture/health-memory";
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

  it("matches the safe cross-platform repository message", () => {
    const error = new HealthMemoryRepositoryError("health-memory-record-not-found", "private adapter detail");
    expect(normalizeHealthMobileError(error)).toEqual({
      message: "The local Health preview could not save that change. Reload and try again.",
      fieldErrors: {},
    });
  });
});
