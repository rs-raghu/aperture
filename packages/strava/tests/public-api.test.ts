import { expect, it } from "vitest";
it("exposes client-safe and server APIs through separate public imports", async () => {
  const client = await import("@aperture/strava"); const server = await import("@aperture/strava/server");
  expect(client.createStravaClient).toBeTypeOf("function"); expect(client.createStravaService).toBeTypeOf("function");
  expect("createStravaTokenCipher" in client).toBe(false); expect(server.createStravaTokenCipher).toBeTypeOf("function");
  expect(server.createStravaPostgresUnitOfWork).toBeTypeOf("function");
});
