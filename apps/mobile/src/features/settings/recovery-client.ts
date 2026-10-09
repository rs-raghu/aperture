import { createRecoveryClient, type RecoveryClient } from "@aperture/backup";
import type { SupabaseClient } from "@supabase/supabase-js";
export function createMobileRecoveryClient(client: SupabaseClient | null, configuredOrigin: string | undefined): RecoveryClient | undefined {
  if (client === null || !configuredOrigin) return undefined;
  let origin: URL; try { origin = new URL(configuredOrigin); } catch { return undefined; }
  if (origin.protocol !== "https:" || origin.username !== "" || origin.password !== "" || origin.pathname !== "/" || origin.search !== "" || origin.hash !== "") return undefined;
  return createRecoveryClient({ endpoint: `${origin.origin}/api/recovery`, token: async () => (await client.auth.getSession()).data.session?.access_token ?? null });
}
