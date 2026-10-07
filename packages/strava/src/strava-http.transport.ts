import { z } from "@aperture/validation";
import { STRAVA_SCOPE, StravaError, stravaActivitySchema, type StravaTokens, type StravaTransport } from "./strava.types.js";

export interface StravaHttpOptions {
  readonly clientId: string; readonly clientSecret: string; readonly redirectUri: string;
  readonly clock: { now(): string }; readonly fetch?: typeof fetch;
}
const tokenResponseSchema = z.object({ access_token: z.string().min(1), refresh_token: z.string().min(1), expires_at: z.number().int().positive().safe(), athlete: z.object({ id: z.number().int().positive().safe() }).optional() });

export function createStravaHttpTransport(options: StravaHttpOptions): StravaTransport {
  const redirect = new URL(options.redirectUri);
  if (!/^\d+$/.test(options.clientId) || options.clientSecret.length === 0 || (redirect.protocol !== "https:" && !(redirect.protocol === "http:" && ["localhost", "127.0.0.1"].includes(redirect.hostname)))) throw new StravaError("strava-invalid-configuration", "Strava requires a client identifier, secret, and HTTPS callback URL.");
  const send = options.fetch ?? fetch;
  async function request(path: string, init: RequestInit): Promise<unknown> {
    let response: Response;
    try { response = await send(`https://www.strava.com${path}`, { ...init, signal: AbortSignal.timeout(15_000), redirect: "error", cache: "no-store" }); }
    catch { throw new StravaError("strava-network-failed", "Strava is temporarily unreachable."); }
    if (response.status === 429) {
      const now = Date.parse(options.clock.now());
      const retryHeader = response.headers.get("retry-after");
      const retrySeconds = retryHeader === null ? NaN : Number(retryHeader);
      let retryAt = Math.floor(now / 900_000) * 900_000 + 900_000;
      if (Number.isFinite(retrySeconds) && retrySeconds > 0) retryAt = now + Math.min(retrySeconds, 86_400) * 1000;
      else if (retryHeader !== null && Number.isFinite(Date.parse(retryHeader))) retryAt = Math.max(now + 1000, Date.parse(retryHeader));
      for (const prefix of ["x-ratelimit", "x-readratelimit"]) {
        const limit = response.headers.get(`${prefix}-limit`)?.split(",").map(Number);
        const usage = response.headers.get(`${prefix}-usage`)?.split(",").map(Number);
        if (limit?.[1] !== undefined && usage?.[1] !== undefined && usage[1] >= limit[1]) retryAt = Math.floor(now / 86_400_000) * 86_400_000 + 86_400_000;
      }
      throw new StravaError("strava-rate-limited", "Strava's request limit has been reached.", new Date(retryAt).toISOString());
    }
    if (response.status === 401) throw new StravaError("strava-unauthorized", "Strava authorization is unavailable. Reconnect the integration.");
    if (response.status === 404) throw new StravaError("strava-not-found", "The Strava activity is unavailable.");
    if (!response.ok) throw new StravaError("strava-provider-failed", "Strava rejected the request.");
    if (response.headers.get("content-length") === "0" || response.status === 204) return undefined;
    try { const text = await response.text(); return text.length === 0 ? undefined : JSON.parse(text) as unknown; }
    catch { throw new StravaError("strava-invalid-response", "Strava returned an invalid response."); }
  }
  async function tokenRequest(fields: Readonly<Record<string, string>>, previousAthleteId?: string): Promise<StravaTokens> {
    const raw = await request("/oauth/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: options.clientId, client_secret: options.clientSecret, ...fields }) });
    const parsed = tokenResponseSchema.safeParse(raw);
    if (!parsed.success || (parsed.data.athlete === undefined && previousAthleteId === undefined)) throw new StravaError("strava-invalid-response", "Strava returned an invalid authorization envelope.");
    if (previousAthleteId !== undefined && parsed.data.athlete !== undefined && String(parsed.data.athlete.id) !== previousAthleteId) throw new StravaError("strava-athlete-mismatch", "The refreshed authorization belongs to a different athlete.");
    return { accessToken: parsed.data.access_token, refreshToken: parsed.data.refresh_token, expiresAt: parsed.data.expires_at, athleteId: parsed.data.athlete === undefined ? previousAthleteId! : String(parsed.data.athlete.id) };
  }
  const authenticated = (tokens: StravaTokens): RequestInit => ({ headers: { authorization: `Bearer ${tokens.accessToken}` } });
  return {
    authorizationUrl(state) { const url = new URL("https://www.strava.com/oauth/authorize"); url.search = new URLSearchParams({ client_id: options.clientId, redirect_uri: options.redirectUri, response_type: "code", approval_prompt: "auto", scope: STRAVA_SCOPE, state }).toString(); return url.toString(); },
    exchange(code) { return tokenRequest({ grant_type: "authorization_code", code }); },
    refresh(tokens) { return tokenRequest({ grant_type: "refresh_token", refresh_token: tokens.refreshToken }, tokens.athleteId); },
    async revoke(tokens) { await request("/oauth/revoke", { method: "POST", headers: { authorization: `Basic ${Buffer.from(`${options.clientId}:${options.clientSecret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token: tokens.refreshToken, token_type_hint: "refresh_token" }) }); },
    async activities(tokens, after, page) { const raw = await request(`/api/v3/athlete/activities?${new URLSearchParams({ after: String(after), page: String(page), per_page: "100" })}`, authenticated(tokens)); const result = z.array(stravaActivitySchema).safeParse(raw); if (!result.success) throw new StravaError("strava-invalid-response", "Strava returned invalid activity data."); return result.data; },
    async activity(tokens, id) { const raw = await request(`/api/v3/activities/${id}`, authenticated(tokens)); const result = stravaActivitySchema.safeParse(raw); if (!result.success) throw new StravaError("strava-invalid-response", "Strava returned invalid activity data."); return result.data; },
    async verifyAthlete(tokens) {
      const value = z.object({ id: z.number().int().positive().safe() }).safeParse(await request("/api/v3/athlete", authenticated(tokens)));
      if (!value.success || String(value.data.id) !== tokens.athleteId) throw new StravaError("strava-athlete-mismatch", "Strava returned an unexpected athlete.");
    },
  };
}
