import "server-only";
import { createClient } from "@supabase/supabase-js";
import { after } from "next/server";
import { createStravaServerRuntime, createStravaHttpHandlers, type StravaServerRuntime } from "@aperture/strava/server";
import { readWebAuthenticationConfiguration } from "@/lib/auth/configuration";
import { getWebOwner } from "@/lib/auth/owner-session";
import { reportOperationalEvent } from "@/lib/operations/reporter";

let runtime: StravaServerRuntime | undefined;
type Operation = "status" | "command" | "callback" | "verify" | "webhook";
export async function handleStravaRequest(request: Request, operation: Operation): Promise<Response> {
  try {
    const configuration = readWebAuthenticationConfiguration();
    const ownerId = configuration.ownerId;
    if (ownerId === undefined) return Response.json({ error: "strava-unconfigured" }, { status: 503, headers: { "cache-control": "no-store" } });
    runtime ??= createStravaServerRuntime(process.env, ownerId);
    const trustedOrigin = new URL(process.env.APERTURE_WEB_ORIGIN ?? process.env.STRAVA_REDIRECT_URI ?? "http://localhost:3000").origin;
    const handlers = createStravaHttpHandlers({
      runtime, trustedOrigin,
      authenticate: async (incoming) => {
        const authorization = incoming.headers.get("authorization");
        if (authorization !== null) {
          if (configuration.mode !== "supabase" || !authorization.startsWith("Bearer ")) return null;
          const client = createClient(configuration.supabaseUrl!, configuration.supabasePublishableKey!, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
          const result = await client.auth.getUser(authorization.slice(7));
          const user = result.data.user;
          return result.error === null && user !== null && user.id === ownerId && user.email?.trim().toLowerCase() === configuration.ownerEmail.trim().toLowerCase() ? user.id : null;
        }
        return (await getWebOwner())?.ownerId ?? null;
      },
      schedule: (work) => after(async () => { try { await work(); } catch { reportOperationalEvent("strava-queue-unavailable"); } }),
    });
    return handlers[operation](request);
  } catch { return Response.json({ error: "strava-unconfigured" }, { status: 503, headers: { "cache-control": "no-store", "referrer-policy": "no-referrer" } }); }
}
