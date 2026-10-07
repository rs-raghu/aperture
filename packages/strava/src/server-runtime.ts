import { randomBytes, randomUUID } from "node:crypto";
import { Pool } from "pg";
import { createStravaService } from "./strava.service.js";
import { StravaError } from "./strava.types.js";
import { createStravaTokenCipher } from "./token-cipher.js";
import { createStravaHttpTransport } from "./strava-http.transport.js";
import { createMockStravaTransport, createStravaMockService } from "./strava-memory.runtime.js";
import { createNodePostgresExecutor } from "./postgres-executor.js";
import { createStravaPostgresRepository, createStravaPostgresUnitOfWork, createStravaPostgresQueueTransaction } from "./strava-postgres.repository.js";

export type StravaServerRuntime = { readonly mode: "disabled"; readonly ownerId: string; readonly service: null } | { readonly mode: "mock" | "live"; readonly ownerId: string; readonly service: ReturnType<typeof createStravaService> };
export function createStravaServerRuntime(environment: Readonly<Record<string, string | undefined>>, ownerId: string): StravaServerRuntime {
  const mode = environment.APERTURE_STRAVA_MODE ?? "disabled";
  if (mode === "disabled") return { mode, ownerId, service: null };
  if (mode !== "mock" && mode !== "live") throw new StravaError("strava-invalid-configuration", "Choose a valid Strava integration mode.");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ownerId)) throw new StravaError("strava-invalid-configuration", "Strava requires a configured owner identifier.");
  const clock = { now: () => new Date().toISOString() }; const idGenerator = { generate: randomUUID }; const stateGenerator = { generate: () => randomBytes(32).toString("base64url") };
  const required = (name: string) => { const value = environment[name]?.trim(); if (!value) throw new StravaError("strava-unconfigured", `Configure ${name} on the server to enable Strava.`); return value; };
  if (mode === "mock") {
    if (environment.NODE_ENV === "production") throw new StravaError("strava-invalid-configuration", "Synthetic Strava mode is limited to development.");
    const cipher = createStravaTokenCipher(randomBytes(32).toString("base64"));
    const transport = createMockStravaTransport({ clock, authorizationUrl: (state) => `/api/integrations/strava/callback?${new URLSearchParams({ state, code: "synthetic-code", scope: "activity:read" })}` });
    return { mode, ownerId, service: createStravaMockService({ ownerId, clock, idGenerator, stateGenerator, cipher, transport }).service };
  }
  if (environment.APERTURE_OWNER_ID !== ownerId) throw new StravaError("strava-owner-denied", "The server integration owner does not match the authenticated owner.");
  const url = new URL(required("DATABASE_URL"));
  if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new StravaError("strava-invalid-configuration", "Strava storage requires PostgreSQL.");
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
  // Strip URL SSL switches so they cannot override certificate verification on the Pool.
  for (const name of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(name);
  const cipher = createStravaTokenCipher(required("STRAVA_TOKEN_ENCRYPTION_KEY"));
  const transport = createStravaHttpTransport({ clientId: required("STRAVA_CLIENT_ID"), clientSecret: required("STRAVA_CLIENT_SECRET"), redirectUri: required("STRAVA_REDIRECT_URI"), clock });
  const verifyToken = required("STRAVA_WEBHOOK_VERIFY_TOKEN");
  const subscription = environment.STRAVA_WEBHOOK_SUBSCRIPTION_ID;
  const subscriptionId = subscription === undefined || subscription === "" ? undefined : Number(subscription);
  if (subscriptionId !== undefined && (!Number.isSafeInteger(subscriptionId) || subscriptionId <= 0)) throw new StravaError("strava-invalid-configuration", "The Strava subscription identifier must be a positive integer.");
  const pool = new Pool({ connectionString: url.toString(), ssl: local ? false : { rejectUnauthorized: true }, max: 3, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 30_000 });
  pool.on("error", () => { console.warn("Strava database connection closed unexpectedly."); });
  const database = createNodePostgresExecutor(pool);
  const options = { clock, idGenerator };
  return { mode, ownerId, service: createStravaService({ ownerId, clock, stateGenerator, cipher, transport, repository: createStravaPostgresRepository(database, options), unitOfWork: createStravaPostgresUnitOfWork(database, options), queueTransaction: createStravaPostgresQueueTransaction(database, options), webhookVerifyToken: verifyToken, ...(subscriptionId === undefined ? {} : { subscriptionId }) }) };
}
