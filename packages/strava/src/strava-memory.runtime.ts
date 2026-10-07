import { createHealthService, type RunningActivity } from "@aperture/health";
import { createHealthMemoryRepository } from "@aperture/health-memory";
import { createStravaService } from "./strava.service.js";
import { StravaError, type StoredStravaConnection, type StravaCipher, type StravaImportReceipt, type StravaQueueEvent, type StravaRepository, type StravaTokens, type StravaTransport, type StravaUnitOfWork, type StravaActivity } from "./strava.types.js";

interface MemoryState {
  connections: Map<string, StoredStravaConnection>;
  states: Map<string, { digest: string; expiresAt: string }>;
  receipts: Map<string, StravaImportReceipt>;
  events: Map<string, StravaQueueEvent & { state: "pending" | "processed" | "failed"; createdAt: string }>;
}
const receiptKey = (ownerId: string, athleteId: string, id: string) => `${ownerId}/${athleteId}/${id}`;

export function createStravaMemoryStore(options: { readonly clock: { now(): string }; readonly idGenerator: { generate(): string } }) {
  let durable: MemoryState = { connections: new Map(), states: new Map(), receipts: new Map(), events: new Map() };
  let healthRecords: readonly RunningActivity[] = [];
  let pending: Promise<void> = Promise.resolve();
  function repositoryFor(state: () => MemoryState): StravaRepository {
    return {
      async connection(ownerId) { return structuredClone(state().connections.get(ownerId) ?? null); },
      async saveConnection(value) { state().connections.set(value.status.ownerId, structuredClone(value)); },
      async saveState(ownerId, digest, expiresAt) { state().states.set(ownerId, { digest, expiresAt }); },
      async consumeState(ownerId, digest, now) { const value = state().states.get(ownerId); if (value === undefined || value.digest !== digest || Date.parse(value.expiresAt) <= Date.parse(now)) return false; state().states.delete(ownerId); return true; },
      async receipt(ownerId, athleteId, activityId) { return structuredClone(state().receipts.get(receiptKey(ownerId, athleteId, activityId)) ?? null); },
      async saveReceipt(value) { const key = receiptKey(value.ownerId, value.athleteId, value.activityId); if (state().receipts.has(key)) throw new StravaError("strava-duplicate-import", "The activity was already imported."); state().receipts.set(key, structuredClone(value)); },
      async receipts(ownerId, athleteId) { return structuredClone([...state().receipts.values()].filter((row) => row.ownerId === ownerId && row.athleteId === athleteId)); },
      async deleteReceipt(value) { state().receipts.delete(receiptKey(value.ownerId, value.athleteId, value.activityId)); },
      async enqueue(value, since, maxPending) { const key = `${value.ownerId}/${value.id}`; const rows = [...state().events.values()].filter((row) => row.ownerId === value.ownerId && (row.state === "pending" || row.createdAt >= since)); if (state().events.has(key) || rows.length >= maxPending) return false; state().events.set(key, { ...structuredClone(value), createdAt: options.clock.now(), state: "pending" }); return true; },
      async pending(ownerId, limit) { return structuredClone([...state().events.values()].filter((row) => row.ownerId === ownerId && row.state === "pending" && row.attempts < 3).slice(0, limit)); },
      async finishEvent(ownerId, id, retry) { const row = state().events.get(`${ownerId}/${id}`); if (row !== undefined) state().events.set(`${ownerId}/${id}`, { ...row, attempts: row.attempts + 1, state: retry ? row.attempts + 1 < 3 ? "pending" : "failed" : "processed" }); },
      async clearPrivateState(ownerId) { state().states.delete(ownerId); const current = state().connections.get(ownerId); if (current !== undefined) state().connections.set(ownerId, { status: current.status }); for (const [key, event] of state().events) if (event.ownerId === ownerId) state().events.delete(key); },
    };
  }
  const repository = repositoryFor(() => durable);
  const unitOfWork: StravaUnitOfWork = {
    run(ownerId, work) {
      const result = pending.then(async () => {
        const snapshot = structuredClone(durable);
        const repositories = createHealthMemoryRepository();
        for (const record of healthRecords) await repositories.runningActivities.create(record);
        const health = createHealthService({ repositories, clock: options.clock, idGenerator: options.idGenerator });
        const output = await work({ repository: repositoryFor(() => snapshot), health });
        const records: RunningActivity[] = healthRecords.filter((record) => record.ownerId !== ownerId).map((record) => structuredClone(record));
        let cursor: string | undefined;
        do { const page = await repositories.runningActivities.findMany({ ownerId, limit: 100, ...(cursor === undefined ? {} : { cursor }) }); records.push(...page.items); cursor = page.nextCursor; } while (cursor !== undefined);
        durable = snapshot; healthRecords = records;
        return output;
      });
      // Keep the serialization tail usable after a rejected transaction. The caller still receives the rejection.
      pending = result.then(() => undefined, () => undefined);
      return result;
    },
  };
  return { repository, unitOfWork, healthRecords: () => structuredClone(healthRecords) };
}

export const SYNTHETIC_STRAVA_ACTIVITY: StravaActivity = { id: 401, name: "Synthetic morning run", sport_type: "Run", start_date: "2040-01-01T08:00:00.000Z", distance: 5000.25, moving_time: 1800, elapsed_time: 1900, athlete: { id: 101 } };
export function createMockStravaTransport(options: { readonly clock: { now(): string }; readonly authorizationUrl: (state: string) => string; readonly activities?: readonly StravaActivity[] }): StravaTransport {
  let authorized = false;
  const requireAuthorization = () => { if (!authorized) throw new StravaError("strava-unauthorized", "The synthetic Strava authorization has been revoked."); };
  const tokens = (): StravaTokens => ({ accessToken: "synthetic-mock-access", refreshToken: "synthetic-mock-refresh", expiresAt: Math.floor(Date.parse(options.clock.now()) / 1000) + 21_600, athleteId: "101" });
  const activities = options.activities ?? [SYNTHETIC_STRAVA_ACTIVITY];
  return {
    authorizationUrl: options.authorizationUrl,
    async exchange() { authorized = true; return tokens(); },
    async refresh() { requireAuthorization(); return tokens(); },
    async revoke() { authorized = false; },
    async activities(_tokens, after, page) { requireAuthorization(); return activities.filter((activity) => Date.parse(activity.start_date) / 1000 > after).slice((page - 1) * 100, page * 100).map((activity) => structuredClone(activity)); },
    async activity(_tokens, id) { requireAuthorization(); const found = activities.find((value) => value.id === id); if (found === undefined) throw new StravaError("strava-not-found", "The synthetic activity is unavailable."); return structuredClone(found); },
    async verifyAthlete() { requireAuthorization(); },
  };
}
export function createStravaMockService(options: { readonly ownerId: string; readonly clock: { now(): string }; readonly idGenerator: { generate(): string }; readonly stateGenerator: { generate(): string }; readonly cipher: StravaCipher; readonly transport: StravaTransport; readonly subscriptionId?: number; readonly webhookVerifyToken?: string }) {
  const store = createStravaMemoryStore(options);
  return { ...store, service: createStravaService({ ...options, ...store }) };
}
