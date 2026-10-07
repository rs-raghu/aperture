import { createHealthService } from "@aperture/health";
import { createHealthPostgresRepository, type SqlExecutor, type TransactionalSqlExecutor } from "@aperture/postgres-repositories";
import type { StoredStravaConnection, StravaImportReceipt, StravaQueueEvent, StravaRepository, StravaStatus, StravaUnitOfWork } from "./strava.types.js";

interface Options { readonly clock: { now(): string }; readonly idGenerator: { generate(): string }; }
function uuidFromDigest(digest: string): string { const value = digest.slice(0, 32); return `${value.slice(0, 8)}-${value.slice(8, 12)}-4${value.slice(13, 16)}-8${value.slice(17, 20)}-${value.slice(20, 32)}`; }

export function createStravaPostgresRepository(database: SqlExecutor, options: Options): StravaRepository {
  const repository: StravaRepository = {
    async connection(ownerId) {
      const row = (await database.query<{ payload: StravaStatus; ciphertext: string | null }>("select c.payload, s.ciphertext from strava.connections c left join strava.credentials s on s.owner_id = c.owner_id where c.owner_id = $1", [ownerId])).rows[0];
      return row === undefined ? null : { status: row.payload, ...(row.ciphertext === null ? {} : { encryptedTokens: row.ciphertext }) };
    },
    async saveConnection(value: StoredStravaConnection) {
      const { status } = value; const now = options.clock.now();
      const previous = (await database.query<{ id: string; created_at: string | Date }>("select id, created_at from platform.integration_connections where owner_id = $1 and integration_id = 'strava' and deleted_at is null", [status.ownerId])).rows[0];
      const publicStatus = { id: previous?.id ?? options.idGenerator.generate(), ownerId: status.ownerId, integrationId: "strava", status: status.status, createdAt: previous === undefined ? now : new Date(previous.created_at).toISOString(), updatedAt: now, ...(status.connectedAt === undefined ? {} : { connectedAt: status.connectedAt }), ...(status.lastSuccessAt === undefined ? {} : { lastSynchronizedAt: status.lastSuccessAt }), ...(status.lastErrorCode === undefined ? {} : { lastErrorCode: status.lastErrorCode }) };
      const publicRow = (await database.query<{ id: string }>("insert into platform.integration_connections(id, owner_id, payload, created_at, updated_at, integration_id, status, connected_at, last_synchronized_at, last_error_code) values ($1, $2, $3::jsonb, $4::timestamptz, $4::timestamptz, 'strava', $5, $6::timestamptz, $7::timestamptz, $8) on conflict (owner_id, integration_id) where deleted_at is null do update set payload = excluded.payload || jsonb_build_object('id', platform.integration_connections.id, 'createdAt', platform.integration_connections.payload->'createdAt'), updated_at = excluded.updated_at, status = excluded.status, connected_at = excluded.connected_at, last_synchronized_at = excluded.last_synchronized_at, last_error_code = excluded.last_error_code returning id", [publicStatus.id, status.ownerId, JSON.stringify(publicStatus), now, status.status, status.connectedAt ?? null, status.lastSuccessAt ?? null, status.lastErrorCode ?? null])).rows[0];
      if (publicRow === undefined) throw new Error("Strava status persistence returned no identifier.");
      await database.query("insert into strava.connections(id, owner_id, payload, created_at, updated_at, integration_connection_id) values ($1, $1, $2::jsonb, $3::timestamptz, $3::timestamptz, $4) on conflict (owner_id) do update set payload = excluded.payload, updated_at = excluded.updated_at, integration_connection_id = excluded.integration_connection_id", [status.ownerId, JSON.stringify(status), now, publicRow.id]);
      if (value.encryptedTokens === undefined) await database.query("delete from strava.credentials where owner_id = $1", [status.ownerId]);
      else await database.query("insert into strava.credentials(id, owner_id, ciphertext, created_at, updated_at) values ($1, $1, $2, $3::timestamptz, $3::timestamptz) on conflict (owner_id) do update set ciphertext = excluded.ciphertext, updated_at = excluded.updated_at", [status.ownerId, value.encryptedTokens, now]);
    },
    async saveState(ownerId, digest, expiresAt) { await database.query("insert into strava.oauth_states(id, owner_id, state_digest, expires_at) values ($1, $1, $2, $3::timestamptz) on conflict (owner_id) do update set state_digest = excluded.state_digest, expires_at = excluded.expires_at", [ownerId, digest, expiresAt]); },
    async consumeState(ownerId, digest, now) { return (await database.query("delete from strava.oauth_states where owner_id = $1 and state_digest = $2 and expires_at > $3::timestamptz returning id", [ownerId, digest, now])).rows.length === 1; },
    async receipt(ownerId, athleteId, activityId) {
      const receipt = (await database.query<{ payload: StravaImportReceipt }>("select payload from strava.activity_imports where owner_id = $1 and athlete_id = $2 and activity_id = $3", [ownerId, athleteId, activityId])).rows[0]?.payload;
      if (receipt !== undefined) return receipt;
      // Restored archives retain immutable Health provenance even though private integration state is excluded.
      const record = (await database.query<{ id: string }>("select id from health.running_activities where owner_id = $1 and payload->'sourceReference'->>'provider' = 'strava' and payload->'sourceReference'->>'accountId' = $2 and payload->'sourceReference'->>'recordId' = $3 order by created_at, id limit 1", [ownerId, athleteId, activityId])).rows[0];
      return record === undefined ? null : { ownerId, athleteId, activityId, healthRecordId: record.id };
    },
    async saveReceipt(value) { await database.query("insert into strava.activity_imports(id, owner_id, payload, athlete_id, activity_id, health_record_id) values ($1, $2, $3::jsonb, $4, $5, $6)", [options.idGenerator.generate(), value.ownerId, JSON.stringify(value), value.athleteId, value.activityId, value.healthRecordId]); },
    async receipts(ownerId, athleteId) {
      const receipts = (await database.query<{ payload: StravaImportReceipt }>("select payload from strava.activity_imports where owner_id = $1 and athlete_id = $2 order by activity_id", [ownerId, athleteId])).rows.map(({ payload }) => payload);
      const restored = (await database.query<{ id: string; activity_id: string }>("select id, payload->'sourceReference'->>'recordId' as activity_id from health.running_activities where owner_id = $1 and payload->'sourceReference'->>'provider' = 'strava' and payload->'sourceReference'->>'accountId' = $2", [ownerId, athleteId])).rows.map((record) => ({ ownerId, athleteId, activityId: record.activity_id, healthRecordId: record.id }));
      return [...new Map([...receipts, ...restored].map((receipt) => [receipt.healthRecordId, receipt])).values()];
    },
    async deleteReceipt(value) { await database.query("delete from strava.activity_imports where owner_id = $1 and athlete_id = $2 and activity_id = $3", [value.ownerId, value.athleteId, value.activityId]); },
    async enqueue(value, since, maxPending) {
      const counts = (await database.query<{ count: number }>("select count(*)::int as count from strava.webhook_events where owner_id = $1 and (state = 'pending' or created_at >= $2::timestamptz)", [value.ownerId, since])).rows[0]!.count;
      if (counts >= maxPending) return false;
      return (await database.query("insert into strava.webhook_events(id, owner_id, payload, event_digest, created_at, updated_at) values ($1, $2, $3::jsonb, $4, $5::timestamptz, $5::timestamptz) on conflict (owner_id, event_digest) do nothing returning id", [uuidFromDigest(value.id), value.ownerId, JSON.stringify(value.event), value.id, options.clock.now()])).rows.length === 1;
    },
    async pending(ownerId, limit) { return (await database.query<{ event_digest: string; payload: StravaQueueEvent["event"]; attempts: number }>("select event_digest, payload, attempts from strava.webhook_events where owner_id = $1 and state = 'pending' and attempts < 3 order by created_at, id limit $2", [ownerId, limit])).rows.map((row) => ({ id: row.event_digest, ownerId, event: row.payload, attempts: row.attempts })); },
    async finishEvent(ownerId, id, retry) { await database.query("update strava.webhook_events set attempts = attempts + 1, state = case when $3::boolean and attempts + 1 < 3 then 'pending' when $3::boolean then 'failed' else 'processed' end where owner_id = $1 and event_digest = $2", [ownerId, id, retry]); },
    async clearPrivateState(ownerId) { for (const table of ["credentials", "oauth_states", "webhook_events"]) await database.query(`delete from strava.${table} where owner_id = $1`, [ownerId]); },
  };
  return Object.freeze(repository);
}

export function createStravaPostgresUnitOfWork(database: TransactionalSqlExecutor, options: Options): StravaUnitOfWork {
  return {
    run(ownerId, work) {
      return database.transaction(async (transaction) => {
        const initial: StravaStatus = { integrationId: "strava", ownerId, status: "disconnected" };
        const repository = createStravaPostgresRepository(transaction, options);
        if (await repository.connection(ownerId) === null) await repository.saveConnection({ status: initial });
        await transaction.query("select id from strava.connections where owner_id = $1 for no key update", [ownerId]);
        return work({
          repository,
          health: createHealthService({ repositories: createHealthPostgresRepository(transaction, { generateId: () => options.idGenerator.generate() }), clock: options.clock, idGenerator: { generate: () => options.idGenerator.generate() } }),
        });
      });
    },
  };
}

// A separate short queue lock keeps webhook acknowledgement independent of slow provider calls during imports.
export function createStravaPostgresQueueTransaction(database: TransactionalSqlExecutor, options: Options) {
  return {
    run<T>(ownerId: string, work: (repository: StravaRepository) => Promise<T>): Promise<T> {
      return database.transaction(async (transaction) => {
        if (await createStravaPostgresRepository(transaction, options).connection(ownerId) === null) throw new Error("The Strava connection is unavailable.");
        await transaction.query("insert into strava.webhook_limits(id, owner_id) values ($1, $1) on conflict (owner_id) do nothing", [ownerId]);
        await transaction.query("select id from strava.webhook_limits where owner_id = $1 for update", [ownerId]);
        return work(createStravaPostgresRepository(transaction, options));
      });
    },
  };
}
