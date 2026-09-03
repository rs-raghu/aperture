import { randomUUID } from "expo-crypto";
import {
  createEducationMobileRuntime,
  DEVELOPMENT_MOBILE_OWNER_ID,
} from "../src/features/education";

describe("Education mobile runtime adapters", () => {
  it("injects Expo UUID generation and the mobile clock into real workflows", async () => {
    const generatedId = "30000000-0000-4000-8000-000000000010";
    jest.mocked(randomUUID).mockReturnValueOnce(generatedId);
    const timestamp = "2026-09-04T08:30:00.000Z";
    const clock = jest.spyOn(Date.prototype, "toISOString").mockReturnValue(timestamp);

    try {
      const runtime = createEducationMobileRuntime();
      const institution = await runtime.service.createInstitution(runtime.context, {
        name: "Synthetic Institute",
        type: "university",
        status: "active",
      });

      expect(institution.id).toBe(generatedId);
      expect(institution.ownerId).toBe(DEVELOPMENT_MOBILE_OWNER_ID);
      expect(institution.createdAt).toBe(timestamp);
      expect(institution.updatedAt).toBe(timestamp);
      expect(runtime.clock.now()).toBe(timestamp);
    } finally {
      clock.mockRestore();
    }
  });

  it("keeps two mobile composition roots isolated", async () => {
    const first = createEducationMobileRuntime("40000000-0000-4000-8000-000000000010");
    const second = createEducationMobileRuntime("50000000-0000-4000-8000-000000000010");
    await first.service.createInstitution(first.context, {
      name: "Synthetic Institute",
      type: "university",
      status: "active",
    });

    expect((await first.service.listInstitutions(first.context)).items).toHaveLength(1);
    expect((await second.service.listInstitutions(second.context)).items).toHaveLength(0);
  });
});
