import { describe, expect, it, vi } from "vitest";
import { createStravaTokenCipher } from "../src/token-cipher.js";
import { createStravaHttpTransport } from "../src/strava-http.transport.js";

const tokens = { accessToken: "synthetic-access", refreshToken: "synthetic-refresh", athleteId: "101", expiresAt: 2_209_025_000 };
const clock = { now: () => "2040-01-01T09:07:00.000Z" };
describe("encrypted token boundary", () => {
  it("uses different nonces and authenticates the owner and ciphertext", async () => {
    const cipher = createStravaTokenCipher(Buffer.alloc(32, 1).toString("base64"));
    const a = await cipher.encrypt("owner", tokens); const b = await cipher.encrypt("owner", tokens);
    expect(a).not.toBe(b); expect(a).not.toContain(tokens.accessToken); expect(await cipher.decrypt("owner", a)).toEqual(tokens);
    await expect(cipher.decrypt("other", a)).rejects.toMatchObject({ code: "strava-credential-unavailable" });
    await expect(cipher.decrypt("owner", a.replace(/^v1\./, "v2."))).rejects.toThrow();
    await expect(cipher.decrypt("owner", `${a.slice(0, -4)}AAAA`)).rejects.toThrow();
    expect(cipher.equals("abc", "abc")).toBe(true); expect(cipher.equals("abc", "abd")).toBe(false); expect(cipher.equals("abc", "ab")).toBe(false);
    expect(() => createStravaTokenCipher("bad-key")).toThrow();
  });
});
function transport(send: typeof fetch) { return createStravaHttpTransport({ clientId: "42", clientSecret: "synthetic-client-secret", redirectUri: "https://aperture.example.invalid/api/integrations/strava/callback", clock, fetch: send }); }
describe("server Strava HTTP boundary", () => {
  it("requests only activity read and places secrets in request bodies or headers", async () => {
    const send = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ access_token: tokens.accessToken, refresh_token: tokens.refreshToken, expires_at: tokens.expiresAt, athlete: { id: 101 } }));
    const service = transport(send); const url = new URL(service.authorizationUrl("state"));
    expect(url.searchParams.get("scope")).toBe("activity:read"); expect(url.toString()).not.toContain("synthetic-client-secret");
    expect(await service.exchange("synthetic-code")).toEqual(tokens);
    const [target, request] = send.mock.calls[0]!; expect(String(target)).not.toContain("synthetic-code");
    expect(String(request?.body)).toContain("client_secret=synthetic-client-secret"); expect(request?.redirect).toBe("error");
    send.mockResolvedValue(new Response(null, { status: 200 })); await service.revoke(tokens);
    expect(send.mock.calls[1]?.[0]).toBe("https://www.strava.com/oauth/revoke");
    expect(String(send.mock.calls[1]?.[1]?.body)).toContain("token_type_hint=refresh_token");
  });
  it.each([
    [{}, "2040-01-01T09:15:00.000Z"],
    [{ "retry-after": "120" }, "2040-01-01T09:09:00.000Z"],
    [{ "x-readratelimit-limit": "100,1000", "x-readratelimit-usage": "100,1000" }, "2040-01-02T00:00:00.000Z"],
  ])("calculates bounded backoff from rate-limit metadata", async (headers, retryAt) => {
    const service = transport(vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 429, headers })));
    await expect(service.activities(tokens, 0, 1)).rejects.toMatchObject({ code: "strava-rate-limited", retryAt });
  });
  it("sanitizes provider and network errors and checks athlete identity", async () => {
    const send = vi.fn<typeof fetch>().mockRejectedValue(new Error("secret-provider-error")); const service = transport(send);
    await expect(service.activities(tokens, 0, 1)).rejects.toMatchObject({ code: "strava-network-failed", message: "Strava is temporarily unreachable." });
    send.mockResolvedValue(Response.json({ id: 999 })); await expect(service.verifyAthlete(tokens)).rejects.toMatchObject({ code: "strava-athlete-mismatch" });
    send.mockResolvedValue(Response.json({ access_token: "access", refresh_token: "refresh", expires_at: tokens.expiresAt, athlete: { id: 999 } }));
    await expect(service.refresh(tokens)).rejects.toMatchObject({ code: "strava-athlete-mismatch" });
    send.mockResolvedValue(Response.json({ invalid: "payload" })); await expect(service.activities(tokens, 0, 1)).rejects.toMatchObject({ code: "strava-invalid-response" });
  });
});
