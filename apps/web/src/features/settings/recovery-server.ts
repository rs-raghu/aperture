import "server-only";
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import { createRecoveryHandler } from "@aperture/backup";
import { createPostgresBackupService, type TransactionalSqlExecutor } from "@aperture/postgres-repositories";
import { createNodePostgresExecutor, createSecurePostgresPool } from "@aperture/postgres-repositories/node";
import { serverRecoveryAdapterFactories } from "@/generated/plugin-recovery-adapters.generated";
import { readWebAuthenticationConfiguration } from "@/lib/auth/configuration";
import { getWebOwner } from "@/lib/auth/owner-session";

let pool: Pool | undefined;
let recoveryWindow = { startedAt: 0, requests: 0 };
function allowRecoveryRequest(): boolean {
  const now = Date.now();
  if (now - recoveryWindow.startedAt >= 60_000) recoveryWindow = { startedAt: now, requests: 0 };
  return ++recoveryWindow.requests <= 30;
}
function database(): TransactionalSqlExecutor | null {
  if (process.env.APERTURE_RECOVERY_ENABLED !== "true" || !process.env.DATABASE_URL) return null;
  if (pool === undefined) {
    pool = createSecurePostgresPool(process.env.DATABASE_URL, 1);
    pool.on("error", () => console.warn("Recovery database connection is unavailable."));
  }
  return createNodePostgresExecutor(pool);
}
export async function handleRecoveryRequest(request: Request): Promise<Response> {
  try {
    const configuration = readWebAuthenticationConfiguration();
    if (configuration.mode !== "supabase" || configuration.ownerId === undefined) return Response.json({ error: "recovery-unconfigured" }, { status: 503, headers: { "cache-control": "no-store" } });
    const ownerId = configuration.ownerId;
    const origin = new URL(process.env.APERTURE_WEB_ORIGIN ?? process.env.NEXT_PUBLIC_APP_ORIGIN ?? "").origin;
    const connection = database();
    const service = connection === null ? null : createPostgresBackupService(connection, {
      clock: { now: () => new Date().toISOString() }, idGenerator: { generate: randomUUID }, lockForRecovery: true,
      additionalAdapters: (transaction) => serverRecoveryAdapterFactories.map((factory) => factory(transaction)),
    });
    return createRecoveryHandler({ ownerId, trustedOrigin: origin, service, allowMutationRequest: allowRecoveryRequest,
      authenticate: async (incoming) => {
        const authorization = incoming.headers.get("authorization");
        if (authorization !== null) {
          if (!authorization.startsWith("Bearer ")) return null;
          const client = createClient(configuration.supabaseUrl!, configuration.supabasePublishableKey!, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
          const result = await client.auth.getUser(authorization.slice(7)); const user = result.data.user;
          return result.error === null && user !== null && user.id === ownerId && user.email?.trim().toLowerCase() === configuration.ownerEmail.trim().toLowerCase() ? user.id : null;
        }
        return (await getWebOwner())?.ownerId ?? null;
      },
      onUnavailable: () => console.warn("Transactional recovery is unavailable; no personal payload was logged."),
    })(request);
  } catch { return Response.json({ error: "recovery-unconfigured" }, { status: 503, headers: { "cache-control": "no-store" } }); }
}
