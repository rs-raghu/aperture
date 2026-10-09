import type { Pool } from "pg";
import { createSecurePostgresPool } from "@aperture/postgres-repositories/node";
import { getWebOwner } from "@/lib/auth/owner-session";
import { readWebAuthenticationConfiguration } from "@/lib/auth/configuration";
import { readinessResponse } from "@/lib/operations/readiness";
import { reportOperationalEvent } from "@/lib/operations/reporter";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
let pool: Pool | undefined;
export async function GET(): Promise<Response> {
  return readinessResponse({
    authenticate: async () => { const configuration = readWebAuthenticationConfiguration(); const owner = await getWebOwner(); return configuration.mode === "supabase" && configuration.ownerId !== undefined && owner?.ownerId === configuration.ownerId; },
    probe: async () => {
      if (process.env.APERTURE_RECOVERY_ENABLED !== "true" || !process.env.DATABASE_URL) throw new Error("Recovery unavailable.");
      if (pool === undefined) { pool = createSecurePostgresPool(process.env.DATABASE_URL, 1); pool.on("error", () => reportOperationalEvent("readiness-unavailable")); }
      await pool.query("select 1");
    },
    unavailable: () => reportOperationalEvent("readiness-unavailable"),
  });
}
