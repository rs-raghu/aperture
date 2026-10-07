import { z } from "@aperture/validation";
export interface StravaClientStatus { readonly mode: "disabled" | "mock" | "live"; readonly status: z.infer<typeof statusSchema>; }
const statusSchema = z.object({ integrationId: z.literal("strava"), ownerId: z.string(), status: z.enum(["disconnected", "connecting", "connected", "error"]), athleteId: z.string().optional(), connectedAt: z.string().optional(), lastSuccessAt: z.string().optional(), lastErrorCode: z.string().optional(), retryAt: z.string().optional(), nextPage: z.number().optional(), syncAfter: z.number().optional(), syncStartedAt: z.string().optional() });
export function stravaErrorMessage(code: string): string {
  if (code === "strava-unconfigured") return "Strava is disabled or has not been configured on your server.";
  if (code === "strava-rate-limited") return "Strava’s request limit was reached. Try again after the reset time.";
  if (["strava-not-connected", "strava-unauthorized", "strava-credential-unavailable"].includes(code)) return "Reconnect Strava to resume importing activities.";
  if (["strava-unauthenticated", "strava-owner-denied"].includes(code)) return "Your owner session could not be verified. Sign in again.";
  if (code === "strava-deletion-confirmation") return "Enter the exact confirmation before deleting imported runs.";
  return "The Strava operation could not be completed. Refresh the status and try again.";
}
export function createStravaClient(options: { readonly endpoint?: string; readonly headers?: () => Promise<Readonly<Record<string, string>>>; readonly fetch?: typeof fetch }) {
  const endpoint = options.endpoint ?? "/api/integrations/strava"; const send = options.fetch ?? fetch;
  async function request(body?: unknown): Promise<unknown> {
    const headers = await options.headers?.();
    let response: Response;
    try { response = await send(endpoint, { method: body === undefined ? "GET" : "POST", credentials: endpoint.startsWith("/") ? "same-origin" : "omit", cache: "no-store", headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); }
    catch { throw new Error("Your server could not be reached. Check your connection and try again."); }
    let value: unknown; try { value = await response.json(); } catch { throw new Error("Your server returned an unreadable Strava response."); }
    if (!response.ok) { const error = z.object({ error: z.string() }).safeParse(value); throw new Error(stravaErrorMessage(error.success ? error.data.error : "unknown")); }
    return value;
  }
  return {
    async status(): Promise<StravaClientStatus> { return z.object({ mode: z.enum(["disabled", "mock", "live"]), status: statusSchema }).parse(await request()); },
    async connect(): Promise<string> { return z.object({ authorizationUrl: z.string().min(1) }).parse(await request({ action: "connect" })).authorizationUrl; },
    async sync(): Promise<number> { return z.object({ imported: z.number().int().nonnegative() }).parse(await request({ action: "sync" })).imported; },
    async disconnect(deleteImportedData: boolean, confirmation: string): Promise<void> { await request({ action: "disconnect", deleteImportedData, confirmation }); },
  };
}
export type StravaClient = ReturnType<typeof createStravaClient>;
