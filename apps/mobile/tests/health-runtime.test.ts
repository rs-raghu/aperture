import { randomUUID } from "expo-crypto";
import { createHealthMobileRuntime, HEALTH_DEVELOPMENT_MOBILE_OWNER_ID } from "../src/features/health";

describe("Health mobile runtime adapters", () => {
  it("injects Expo UUID generation and the mobile clock", async () => {
    const id = "86000000-0000-4000-8000-000000000010";
    jest.mocked(randomUUID).mockReturnValueOnce(id);
    const timestamp = "2040-01-01T08:30:00.000Z";
    const clock = jest.spyOn(Date.prototype, "toISOString").mockReturnValue(timestamp);
    try {
      const runtime = createHealthMobileRuntime();
      const profile = await runtime.service.createHealthProfile(runtime.context, { measurementSystem: "metric" });
      expect(profile.id).toBe(id);
      expect(profile.ownerId).toBe(HEALTH_DEVELOPMENT_MOBILE_OWNER_ID);
      expect(profile.createdAt).toBe(timestamp);
      expect(runtime.clock.now()).toBe(timestamp);
    } finally { clock.mockRestore(); }
  });

  it("exposes real Health and memory behavior through the public feature import", async () => {
    const runtime = createHealthMobileRuntime("87000000-0000-4000-8000-000000000010");
    await runtime.service.recordHydration(runtime.context, { volume: { value: "125", unit: "milliliter" }, consumedAt: "2040-01-01T08:00:00Z" });
    expect((await runtime.service.listHydrationEntries(runtime.context)).items).toHaveLength(1);
  });
});
