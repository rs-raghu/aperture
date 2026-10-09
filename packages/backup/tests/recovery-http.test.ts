import { describe, expect, it } from "vitest";
import { createBackupService, createRecoveryClient, createRecoveryHandler, checksum, type BackupFeatureAdapter, type JsonObject } from "../src/index.js";
const OWNER = "70000000-0000-4000-8000-000000000001";
const OTHER = "70000000-0000-4000-8000-000000000002";
const ORIGIN = "https://owned.example.invalid";
function harness() {
  let records: JsonObject[] = [{ id: "80000000-0000-4000-8000-000000000001", ownerId: OWNER, title: "Private draft" }];
  const adapter: BackupFeatureAdapter = {
    featureId: "education", schemaVersion: 1,
    async export(ownerId) { return [{ name: "records", records: structuredClone(records.filter((record) => record.ownerId === ownerId)) }]; },
    async validate(ownerId, payload) { return payload.collections.length === 1 && payload.collections[0]?.name === "records" && payload.collections[0].records.every((record) => record.ownerId === ownerId && typeof record.id === "string") ? [] : [{ code: "backup-invalid-feature", message: "Invalid owner records." }]; },
    async listRecordIdentities(ownerId) { return records.filter((record) => record.ownerId === ownerId).map((record) => ({ collection: "records", recordId: String(record.id), fingerprint: checksum(record) })); },
    async merge(_ownerId, payload) { records.push(...structuredClone(payload.collections[0]!.records)); },
    async replace(ownerId, payload) { await adapter.deleteAll(ownerId); await adapter.merge(ownerId, payload); },
    async deleteAll(ownerId) { records = records.filter((record) => record.ownerId !== ownerId); },
  };
  const service = createBackupService({ adapters: [adapter], clock: { now: () => "2040-01-01T00:00:00.000Z" }, idGenerator: { generate: () => "90000000-0000-4000-8000-000000000001" }, transactionRunner: { async run(work) { const before = structuredClone(records); try { return await work([adapter]); } catch (failure) { records = before; throw failure; } } } });
  const handle = createRecoveryHandler({ ownerId: OWNER, trustedOrigin: ORIGIN, service, authenticate: async (request) => request.headers.get("authorization") === "Bearer owner" ? OWNER : request.headers.get("authorization") === "Bearer other" ? OTHER : null });
  const request = (body: object, extra: Record<string, string> = {}) => handle(new Request(`${ORIGIN}/api/recovery`, { method: "POST", headers: { authorization: "Bearer owner", "content-type": "application/json", ...extra }, body: JSON.stringify(body) }));
  const client = createRecoveryClient({ endpoint: `${ORIGIN}/api/recovery`, token: async () => "owner", fetch: async (input, init) => handle(new Request(typeof input === "string" ? input : input instanceof URL ? input : input.url, init)) });
  return { service, handle, request, client, change: () => { records[0] = { ...records[0], title: "Changed elsewhere" }; }, records: () => structuredClone(records) };
}
describe("authenticated transactional recovery HTTP boundary", () => {
  it("rate limits authenticated recovery before parsing or mutating an archive", async () => {
    const value = harness();
    const handle = createRecoveryHandler({ ownerId: OWNER, trustedOrigin: ORIGIN, service: value.service, authenticate: async () => OWNER, allowMutationRequest: () => false });
    const response = await handle(new Request(`${ORIGIN}/api/recovery`, { method: "POST", headers: { origin: ORIGIN, "content-type": "application/json" }, body: "invalid json" }));
    expect(response.status).toBe(429); expect(value.records()).toHaveLength(1);
    expect((await handle(new Request(`${ORIGIN}/api/recovery`))).status).toBe(200);
  });
  it("requires the verified owner and origin for cookie requests while supporting native bearer requests", async () => {
    const value = harness(); const body = { action: "preview-deletion", featureIds: ["education"] };
    expect((await value.request(body, { authorization: "Bearer other" })).status).toBe(401);
    expect((await value.request(body, { cookie: "session=owner" })).status).toBe(403);
    expect((await value.request(body, { cookie: "session=owner", origin: ORIGIN })).status).toBe(200);
    expect((await value.request(body, { cookie: "session=owner", origin: "https://untrusted.example.invalid" })).status).toBe(403);
    expect((await value.request(body)).status).toBe(200);
    expect((await value.request({ ...body, ownerId: OTHER })).status).toBe(422);
    expect(value.records()).toHaveLength(1);
  });
  it("uses a fresh server preview, exact confirmation, and stale-data checks for restore and deletion", async () => {
    const value = harness(); expect(await value.client.status()).toEqual({ enabled: true });
    const archive = await value.service.export(OWNER); const source = value.service.serialize(archive);
    const review = await value.client.previewRestore(source, "replace"); expect(review.valid).toBe(true);
    await expect(value.client.restore(source, review, "wrong")).rejects.toThrow(/confirmation/);
    value.change(); await expect(value.client.restore(source, review, review.confirmation)).rejects.toThrow(/changed/);
    expect(value.records()[0]?.title).toBe("Changed elsewhere");
    const fresh = await value.client.previewRestore(source, "replace"); await value.client.restore(source, fresh, fresh.confirmation); expect(value.records()[0]?.title).toBe("Private draft");
    const deletion = await value.client.previewDeletion(["education"]); await expect(value.client.deleteData(deletion, "wrong")).rejects.toThrow(/confirmation/); await value.client.deleteData(deletion, deletion.confirmation); expect(value.records()).toEqual([]);
    await expect(value.client.deleteData(deletion, deletion.confirmation)).rejects.toThrow(/changed/);
  });
  it("blocks corrupt, cross-owner, deeply nested, and oversized input without mutation", async () => {
    const value = harness(); const other = await value.service.export(OTHER);
    expect((await value.client.previewRestore(value.service.serialize(other), "replace")).valid).toBe(false);
    expect((await value.request({ action: "restore", source: "{}", mode: "replace", confirmation: "wrong" })).status).toBe(409);
    let nested: object = {}; for (let depth = 0; depth < 45; depth++) nested = { child: nested };
    expect((await value.request({ action: "preview-restore", source: JSON.stringify(nested), mode: "replace" })).status).toBe(422);
    expect((await value.request({ action: "preview-restore", source: "x".repeat(8 * 1024 * 1024), mode: "replace" })).status).toBe(413);
    expect(value.records()).toHaveLength(1);
  });
  it("rejects unsafe endpoint URLs and never returns raw provider errors", async () => {
    expect(() => createRecoveryClient({ endpoint: "http://untrusted.example.invalid/api/recovery" })).toThrow(/HTTPS/);
    expect(() => createRecoveryClient({ endpoint: "https://owner:secret@owned.example.invalid/api/recovery" })).toThrow(/HTTPS/);
    const handle = createRecoveryHandler({ ownerId: OWNER, trustedOrigin: ORIGIN, service: null, authenticate: async () => OWNER });
    expect(await (await handle(new Request(`${ORIGIN}/api/recovery`))).json()).toEqual({ enabled: false });
    const denied = createRecoveryHandler({ ownerId: OWNER, trustedOrigin: ORIGIN, service: null, authenticate: async () => { throw new Error("private database diagnostics"); } });
    expect(await (await denied(new Request(`${ORIGIN}/api/recovery`))).text()).not.toContain("diagnostics");
  });
});
