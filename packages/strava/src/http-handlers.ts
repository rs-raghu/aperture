import { z } from "@aperture/validation";
import { StravaError } from "./strava.types.js";
import type { StravaServerRuntime } from "./server-runtime.js";

const commandSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("connect") }), z.strictObject({ action: z.literal("sync") }),
  z.strictObject({ action: z.literal("disconnect"), deleteImportedData: z.boolean().default(false), confirmation: z.string().max(200).default("") }),
]);
const privateHeaders = { "cache-control": "no-store", "referrer-policy": "no-referrer" };
async function boundedJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new StravaError("strava-invalid-request", "Send a JSON request.");
  const reader = request.body?.getReader(); if (reader === undefined) throw new StravaError("strava-invalid-request", "The request body is missing.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 16_384) { await reader.cancel(); throw new StravaError("strava-request-too-large", "The request is too large."); } chunks.push(part.value); }
  const bytes = new Uint8Array(size); let position = 0; for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)) as unknown; } catch { throw new StravaError("strava-invalid-request", "The request JSON is invalid."); }
}
function failure(error: unknown): Response {
  const code = error instanceof StravaError ? error.code : "strava-operation-failed";
  const status = code === "strava-owner-denied" ? 403 : code === "strava-unauthenticated" ? 401 : code === "strava-rate-limited" ? 429 : code === "strava-unconfigured" ? 503 : code === "strava-request-too-large" ? 413 : 400;
  return Response.json({ error: code }, { status, headers: privateHeaders });
}
export function createStravaHttpHandlers(options: {
  readonly runtime: StravaServerRuntime;
  readonly authenticate: (request: Request) => Promise<string | null>;
  readonly trustedOrigin: string;
  readonly schedule: (work: () => Promise<void>) => void;
}) {
  const { runtime } = options;
  async function owner(request: Request): Promise<string> {
    const ownerId = await options.authenticate(request);
    if (ownerId === null) throw new StravaError("strava-unauthenticated", "Sign in to use Strava.");
    if (ownerId !== runtime.ownerId) throw new StravaError("strava-owner-denied", "Strava is restricted to the configured owner.");
    return ownerId;
  }
  function connectedService() { if (runtime.service === null) throw new StravaError("strava-unconfigured", "Strava is disabled on this server."); return runtime.service; }
  return {
    async status(request: Request) { try { const ownerId = await owner(request); return Response.json({ mode: runtime.mode, status: runtime.service === null ? { status: "disconnected", integrationId: "strava", ownerId } : await runtime.service.status(ownerId) }, { headers: privateHeaders }); } catch (error) { return failure(error); } },
    async command(request: Request) {
      try {
        const ownerId = await owner(request);
        // Cookie-authenticated mutations require the fixed deployment origin; native bearer requests have no ambient cookies.
        if ((!request.headers.has("authorization") || request.headers.has("cookie")) && request.headers.get("origin") !== options.trustedOrigin) throw new StravaError("strava-owner-denied", "The request origin is not allowed.");
        const parsed = commandSchema.safeParse(await boundedJson(request)); if (!parsed.success) throw new StravaError("strava-invalid-request", "Choose a valid Strava operation.");
        const command = parsed.data; const service = connectedService();
        if (command.action === "connect") { const result = await service.beginConnect(ownerId); return Response.json({ authorizationUrl: result.authorizationUrl }, { headers: privateHeaders }); }
        if (command.action === "sync") { await service.processWebhooks(ownerId); return Response.json(await service.synchronize(ownerId), { headers: privateHeaders }); }
        return Response.json({ status: await service.disconnect(ownerId, command.deleteImportedData, command.confirmation) }, { headers: privateHeaders });
      } catch (error) { return failure(error); }
    },
    async callback(request: Request) {
      try {
        const url = new URL(request.url);
        // The callback uses one-use owner-bound state as proof, including native browser returns without a dashboard cookie.
        await connectedService().completeConnect(runtime.ownerId, url.searchParams.get("state") ?? "", url.searchParams.get("code") ?? "", url.searchParams.get("scope") ?? "");
        return new Response(null, { status: 303, headers: { ...privateHeaders, location: `${options.trustedOrigin}/strava/complete` } });
      } catch (error) { return failure(error); }
    },
    async verify(request: Request) { try { const parameters = new URL(request.url).searchParams; return Response.json(connectedService().verifyWebhook(parameters.get("hub.mode"), parameters.get("hub.verify_token"), parameters.get("hub.challenge")), { headers: privateHeaders }); } catch (error) { return failure(error); } },
    async webhook(request: Request) {
      try {
        const service = connectedService(); const accepted = await service.enqueueWebhook(await boundedJson(request));
        if (accepted) options.schedule(async () => { await service.processWebhooks(runtime.ownerId); });
        return Response.json({ received: true }, { headers: privateHeaders });
      } catch (error) { return failure(error); }
    },
  };
}
