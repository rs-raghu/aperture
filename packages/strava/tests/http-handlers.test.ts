import { describe, expect, it, vi } from "vitest";
import { createStravaHttpHandlers } from "../src/http-handlers.js";
import { createStravaServerRuntime } from "../src/server-runtime.js";
import { createStravaMockService, createMockStravaTransport } from "../src/strava-memory.runtime.js";
import { createStravaTokenCipher } from "../src/token-cipher.js";
import { createStravaClient } from "../src/client.js";

const ownerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"; const origin = "https://aperture.example.invalid";
function fixture(authenticated: string | null = ownerId) {
  let sequence = 0; const clock = { now: () => "2040-01-01T09:00:00.000Z" };
  const runtime = createStravaMockService({ ownerId, clock, cipher: createStravaTokenCipher(Buffer.alloc(32, 1).toString("base64")), idGenerator: { generate: () => `record-${++sequence}` }, stateGenerator: { generate: () => "s".repeat(43) }, transport: createMockStravaTransport({ clock, authorizationUrl: (state) => `${origin}/authorize?state=${state}` }) });
  const schedule = vi.fn();
  return { ...runtime, schedule, handlers: createStravaHttpHandlers({ runtime: { mode: "mock", ownerId, service: runtime.service }, authenticate: async () => authenticated, trustedOrigin: origin, schedule }) };
}
const command = (body: unknown, headers: Record<string, string> = {}) => new Request(`${origin}/api/integrations/strava`, { method: "POST", headers: { "content-type": "application/json", origin, ...headers }, body: JSON.stringify(body) });
describe("Strava request boundary", () => {
  it("requires authentication and the configured owner", async () => {
    expect((await fixture(null).handlers.status(new Request(origin))).status).toBe(401);
    expect((await fixture("another-owner").handlers.command(command({ action: "connect" }))).status).toBe(403);
  });
  it("rejects cross-origin cookie writes and accepts validated bearer requests", async () => {
    const f = fixture();
    expect((await f.handlers.command(command({ action: "connect" }, { origin: "https://evil.invalid" }))).status).toBe(403);
    expect((await f.handlers.command(command({ action: "connect" }, { authorization: "Bearer verified-by-authenticate", origin: "https://evil.invalid" }))).status).toBe(200);
    expect((await f.handlers.command(command({ action: "connect" }, { authorization: "Bearer verified", cookie: "session=ambient", origin: "https://evil.invalid" }))).status).toBe(403);
  });
  it("limits JSON size, rejects unknown commands, and never reflects provider secrets", async () => {
    const f = fixture(); expect((await f.handlers.command(command({ action: "unknown" }))).status).toBe(400);
    expect((await f.handlers.command(command({ action: "connect", extra: "x".repeat(20_000) }))).status).toBe(413);
    const response = await f.handlers.callback(new Request(`${origin}/callback?state=invalid&code=secret-code&scope=activity:read`));
    expect(response.status).toBe(400); expect(await response.text()).not.toContain("secret-code");
  });
  it("completes native-browser callbacks using one-use state and a fixed redirect", async () => {
    const f = fixture(null); const result = await f.service.beginConnect(ownerId);
    const request = new Request(`${origin}/callback?${new URLSearchParams({ state: result.state, code: "synthetic-code", scope: "activity:read", returnTo: "https://evil.invalid" })}`);
    const response = await f.handlers.callback(request); expect(response.status).toBe(303); expect(response.headers.get("location")).toBe(`${origin}/strava/complete`);
    expect(response.headers.get("referrer-policy")).toBe("no-referrer"); expect((await f.handlers.callback(request)).status).toBe(400);
  });
  it("keeps the disabled integration usable without credentials", async () => {
    const runtime = createStravaServerRuntime({}, ownerId);
    const handlers = createStravaHttpHandlers({ runtime, authenticate: async () => ownerId, trustedOrigin: origin, schedule: vi.fn() });
    expect(await (await handlers.status(new Request(origin))).json()).toMatchObject({ mode: "disabled" });
    expect((await handlers.command(command({ action: "connect" }))).status).toBe(503);
    expect(() => createStravaServerRuntime({ APERTURE_STRAVA_MODE: "mock", NODE_ENV: "production" }, ownerId)).toThrow();
  });
  it("uses the public client without importing the Node server runtime", async () => {
    const f = fixture();
    const client = createStravaClient({ endpoint: `${origin}/api/integrations/strava`, fetch: async (url, init) => { const request = new Request(url, { ...init, headers: { ...init?.headers, origin } }); return init?.method === "POST" ? f.handlers.command(request) : f.handlers.status(request); } });
    expect(await client.status()).toMatchObject({ mode: "mock", status: { status: "disconnected" } });
    expect(await client.connect()).toContain("/authorize?state=");
  });
});
