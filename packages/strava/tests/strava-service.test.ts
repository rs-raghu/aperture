import { describe, expect, it, vi } from "vitest";
import { createStravaService, mapStravaActivity, StravaError, type StravaTransport, type StravaUnitOfWork } from "../src/index.js";
import { createMockStravaTransport, createStravaMemoryStore, SYNTHETIC_STRAVA_ACTIVITY } from "../src/strava-memory.runtime.js";
import { createStravaTokenCipher } from "../src/token-cipher.js";

const ownerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
function fixture(overrides: Partial<StravaTransport> = {}, count = 1) {
  let now = "2040-01-01T09:07:00.000Z";
  let sequence = 0;
  const clock = { now: () => now };
  const cipher = createStravaTokenCipher(Buffer.alloc(32, 1).toString("base64"));
  const store = createStravaMemoryStore({ clock, idGenerator: { generate: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}` } });
  const transport = { ...createMockStravaTransport({ clock, authorizationUrl: (state) => `https://example.invalid/oauth?state=${state}`, activities: Array.from({ length: count }, (_, i) => ({ ...SYNTHETIC_STRAVA_ACTIVITY, id: 401 + i })) }), ...overrides };
  const dependencies = { ownerId, clock, cipher, ...store, transport, stateGenerator: { generate: () => `${String(++sequence).padStart(32, "x")}` }, subscriptionId: 9, webhookVerifyToken: "synthetic-verification-token" };
  const service = createStravaService(dependencies);
  const connect = async () => { const result = await service.beginConnect(ownerId); await service.completeConnect(ownerId, result.state, "synthetic-code", "read,activity:read"); };
  const event = (changes = {}) => ({ object_type: "activity", aspect_type: "delete", object_id: 401, owner_id: 101, subscription_id: 9, event_time: Date.parse(now) / 1000, updates: {}, ...changes });
  return { ...store, service, dependencies, transport, cipher, clock, connect, event, setNow: (value: string) => { now = value; } };
}

describe("Strava service through the real Health service", () => {
  it("imports completed runs once, including concurrent repeated syncs", async () => {
    const f = fixture(); await f.connect();
    const results = await Promise.all([f.service.synchronize(ownerId), f.service.synchronize(ownerId)]);
    expect(results.reduce((sum, result) => sum + result.imported, 0)).toBe(1);
    expect(f.healthRecords()).toHaveLength(1);
    expect(f.healthRecords()[0]).toMatchObject({ status: "completed", distance: { value: "5000.25", unit: "meter" }, duration: { value: "1800", unit: "second" } });
    expect(await f.service.status(ownerId)).toMatchObject({ status: "connected", lastSuccessAt: f.clock.now() });
    expect(JSON.stringify(await f.service.status(ownerId))).not.toContain("synthetic-mock");
  });
  it("bounds one sync to five pages and continues without losing its watermark", async () => {
    const f = fixture({}, 501); await f.connect();
    expect(await f.service.synchronize(ownerId)).toMatchObject({ imported: 500, status: { nextPage: 6, syncAfter: 0 } });
    expect(await f.service.synchronize(ownerId)).toMatchObject({ imported: 1, status: { lastSuccessAt: f.clock.now() } });
    expect(f.healthRecords()).toHaveLength(501);
  });
  it("rejects another owner before accessing storage", async () => {
    const f = fixture();
    await expect(f.service.beginConnect("another-owner")).rejects.toMatchObject({ code: "strava-owner-denied" });
    await expect(f.service.synchronize("another-owner")).rejects.toMatchObject({ code: "strava-owner-denied" });
    expect(await f.repository.connection("another-owner")).toBeNull();
  });
  it("consumes state once even if exchange fails and rejects expired state", async () => {
    const exchange = vi.fn().mockRejectedValue(new Error("a provider error containing a secret"));
    const f = fixture({ exchange }); const result = await f.service.beginConnect(ownerId);
    await expect(f.service.completeConnect(ownerId, result.state, "code", "activity:read")).rejects.toThrow();
    await expect(f.service.completeConnect(ownerId, result.state, "code", "activity:read")).rejects.toMatchObject({ code: "strava-state-rejected" });
    expect(exchange).toHaveBeenCalledTimes(1);
    expect(await f.service.status(ownerId)).toMatchObject({ lastErrorCode: "strava-operation-failed" });
    const next = await f.service.beginConnect(ownerId); f.setNow("2040-01-01T09:18:00.000Z");
    await expect(f.service.completeConnect(ownerId, next.state, "code", "activity:read")).rejects.toMatchObject({ code: "strava-state-rejected" });
  });
  it("rejects denied scope without exchanging the authorization code", async () => {
    const exchange = vi.fn(); const f = fixture({ exchange }); const result = await f.service.beginConnect(ownerId);
    await expect(f.service.completeConnect(ownerId, result.state, "code", "read")).rejects.toMatchObject({ code: "strava-scope-denied" });
    expect(exchange).not.toHaveBeenCalled();
  });
  it("commits refresh rotation while rolling back a failed import", async () => {
    const f = fixture(); await f.connect();
    f.setNow("2040-01-01T16:00:00.000Z");
    const refresh = vi.fn(async () => ({ accessToken: "rotated-access", refreshToken: "rotated-refresh", athleteId: "101", expiresAt: Date.parse(f.clock.now()) / 1000 + 1000 }));
    const fault: StravaUnitOfWork = { run: (owner, work) => f.unitOfWork.run(owner, (transaction) => work({ ...transaction, health: { ...transaction.health, updateRunningActivity: async () => { throw new Error("injected write failure"); } } })) };
    const service = createStravaService({ ...f.dependencies, transport: { ...f.transport, refresh }, unitOfWork: fault });
    await expect(service.synchronize(ownerId)).rejects.toThrow("injected write failure");
    expect(f.healthRecords()).toHaveLength(0);
    expect(await f.repository.receipts(ownerId, "101")).toHaveLength(0);
    const connection = await f.repository.connection(ownerId);
    expect((await f.cipher.decrypt(ownerId, connection!.encryptedTokens!)).refreshToken).toBe("rotated-refresh");
    expect(refresh).toHaveBeenCalledTimes(1);
  });
  it("persists provider backoff and avoids calls until it expires", async () => {
    const activities = vi.fn().mockRejectedValue(new StravaError("strava-rate-limited", "limit", "2040-01-01T09:15:00.000Z"));
    const f = fixture({ activities }); await f.connect();
    await expect(f.service.synchronize(ownerId)).rejects.toMatchObject({ code: "strava-rate-limited" });
    await expect(f.service.synchronize(ownerId)).rejects.toMatchObject({ code: "strava-rate-limited" });
    expect(activities).toHaveBeenCalledTimes(1);
    expect(await f.service.status(ownerId)).toMatchObject({ retryAt: "2040-01-01T09:15:00.000Z" });
  });
  it("disconnects locally even when remote revoke fails and requires deletion confirmation", async () => {
    const f = fixture({ revoke: async () => { throw new Error("remote failure"); } }); await f.connect(); await f.service.synchronize(ownerId);
    await expect(f.service.disconnect(ownerId, true, "wrong")).rejects.toMatchObject({ code: "strava-deletion-confirmation" });
    expect(await f.service.disconnect(ownerId)).toMatchObject({ status: "disconnected", lastErrorCode: "strava-remote-revoke-failed" });
    expect((await f.repository.connection(ownerId))?.encryptedTokens).toBeUndefined(); expect(f.healthRecords()).toHaveLength(1);
    await f.connect(); await f.service.synchronize(ownerId); expect(f.healthRecords()).toHaveLength(1);
    await f.service.disconnect(ownerId, true, `DELETE STRAVA IMPORTS ${ownerId}`); expect(f.healthRecords()).toHaveLength(0);
  });
  it("verifies subscriptions and deduplicates webhook deliveries", async () => {
    const f = fixture(); await f.connect();
    expect(f.service.verifyWebhook("subscribe", "synthetic-verification-token", "challenge")).toEqual({ "hub.challenge": "challenge" });
    expect(() => f.service.verifyWebhook("subscribe", "wrong", "challenge")).toThrow();
    await expect(f.service.enqueueWebhook(f.event({ subscription_id: 99 }))).rejects.toMatchObject({ code: "strava-webhook-rejected" });
    expect(await f.service.enqueueWebhook(f.event())).toBe(true); expect(await f.service.enqueueWebhook(f.event())).toBe(false);
    expect(await f.service.processWebhooks(ownerId)).toBe(1); expect(f.healthRecords()).toHaveLength(1);
    expect(await f.service.enqueueWebhook(f.event())).toBe(false);
  });
  it("does not trust a delete event until the activity API confirms it is unavailable", async () => {
    const f = fixture(); await f.connect(); await f.service.synchronize(ownerId);
    await f.service.enqueueWebhook(f.event()); await f.service.processWebhooks(ownerId); expect(f.healthRecords()).toHaveLength(1);
    const service = createStravaService({ ...f.dependencies, transport: { ...f.transport, activity: async () => { throw new StravaError("strava-not-found", "gone"); } } });
    await service.enqueueWebhook(f.event({ event_time: Date.parse(f.clock.now()) / 1000 + 1 }));
    await service.processWebhooks(ownerId); expect(f.healthRecords()).toHaveLength(0); expect(await f.repository.receipts(ownerId, "101")).toHaveLength(0);
  });
  it("keeps locally deleted runs deleted during webhook updates", async () => {
    const f = fixture(); await f.connect(); await f.service.synchronize(ownerId);
    await f.unitOfWork.run(ownerId, async ({ health }) => { await health.deleteRunningActivity({ ownerId }, f.healthRecords()[0]!.id); });
    await f.service.enqueueWebhook(f.event({ aspect_type: "update" })); await f.service.processWebhooks(ownerId);
    await f.service.synchronize(ownerId); expect(f.healthRecords()).toHaveLength(0);
  });
  it("ignores spoofed deauthorization and purges only after authoritative 401", async () => {
    const f = fixture(); await f.connect(); await f.service.synchronize(ownerId);
    const event = f.event({ object_type: "athlete", object_id: 101, updates: { authorized: "false" } });
    await f.service.enqueueWebhook(event); await f.service.processWebhooks(ownerId); expect(f.healthRecords()).toHaveLength(1);
    const service = createStravaService({ ...f.dependencies, transport: { ...f.transport, verifyAthlete: async () => { throw new StravaError("strava-unauthorized", "revoked"); } } });
    await service.enqueueWebhook({ ...event, event_time: event.event_time + 1 }); await service.processWebhooks(ownerId);
    expect(f.healthRecords()).toHaveLength(0); expect(await service.status(ownerId)).toMatchObject({ status: "disconnected" });
  });
  it("handles revocation when refresh itself is unauthorized", async () => {
    const f = fixture(); await f.connect(); await f.service.synchronize(ownerId); f.setNow("2040-01-01T16:00:00.000Z");
    const service = createStravaService({ ...f.dependencies, transport: { ...f.transport, refresh: async () => { throw new StravaError("strava-unauthorized", "revoked"); } } });
    await service.enqueueWebhook(f.event({ object_type: "athlete", updates: { authorized: "false" } })); await service.processWebhooks(ownerId);
    expect(f.healthRecords()).toHaveLength(0); expect(await service.status(ownerId)).toMatchObject({ status: "disconnected" });
  });
  it("retains queued jobs and their attempts while rate-limited", async () => {
    const activity = vi.fn().mockRejectedValue(new StravaError("strava-rate-limited", "limit", "2040-01-01T09:15:00.000Z"));
    const f = fixture({ activity }); await f.connect(); await f.service.enqueueWebhook(f.event());
    expect(await f.service.processWebhooks(ownerId)).toBe(0); expect(await f.service.processWebhooks(ownerId)).toBe(0);
    expect((await f.repository.pending(ownerId, 20))[0]?.attempts).toBe(0); expect(activity).toHaveBeenCalledTimes(1);
  });
  it("bounds queue volume, rejects old events, and stops retrying after three provider failures", async () => {
    const f = fixture({ activity: async () => { throw new StravaError("strava-provider-failed", "failure"); } }); await f.connect();
    await expect(f.service.enqueueWebhook(f.event({ event_time: Date.parse(f.clock.now()) / 1000 - 86_401 }))).rejects.toMatchObject({ code: "strava-webhook-rejected" });
    for (let index = 0; index < 100; index += 1) expect(await f.service.enqueueWebhook(f.event({ object_id: index + 1 }))).toBe(true);
    expect(await f.service.enqueueWebhook(f.event({ object_id: 999 }))).toBe(false);
    for (let index = 0; index < 15; index += 1) await f.service.processWebhooks(ownerId);
    expect(await f.repository.pending(ownerId, 100)).toHaveLength(0);
  });
  it("rejects foreign athlete data and unsupported or malformed activities", async () => {
    expect(mapStravaActivity({ ...SYNTHETIC_STRAVA_ACTIVITY, sport_type: "Ride" })).toBeNull();
    expect(() => mapStravaActivity({ ...SYNTHETIC_STRAVA_ACTIVITY, distance: -1 })).toThrow();
    const f = fixture({ activities: async () => [{ ...SYNTHETIC_STRAVA_ACTIVITY, athlete: { id: 999 } }] }); await f.connect();
    await expect(f.service.synchronize(ownerId)).rejects.toMatchObject({ code: "strava-athlete-mismatch" }); expect(f.healthRecords()).toHaveLength(0);
  });
});
