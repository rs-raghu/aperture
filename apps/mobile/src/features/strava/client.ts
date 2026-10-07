import { createStravaClient } from "@aperture/strava";
import type { MobileAuthValue } from "../../lib/auth/mobile-auth-provider";

export function createMobileStravaClient(auth: MobileAuthValue, configuredUrl: string | undefined = process.env.EXPO_PUBLIC_APERTURE_WEB_URL) {
  if (!configuredUrl) throw new Error("Configure your Aperture web server URL to use Strava on mobile.");
  const url = new URL(configuredUrl);
  const localDevelopment = auth.mode === "development-bypass" && ["localhost", "127.0.0.1", "10.0.2.2"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(url.protocol === "http:" && localDevelopment)) || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error("Use your HTTPS Aperture server origin for the Strava connection.");
  return createStravaClient({ endpoint: `${url.origin}/api/integrations/strava`, headers: async (): Promise<Readonly<Record<string, string>>> => {
    if (auth.mode === "development-bypass") return { origin: url.origin };
    const session = await auth.supabaseClient?.auth.getSession();
    if (session?.error !== null || !session.data.session?.access_token) throw new Error("Sign in to use Strava.");
    return { authorization: `Bearer ${session.data.session.access_token}` };
  } });
}

export function validateStravaAuthorizationUrl(value: string, serverOrigin: string): string {
  const url = new URL(value, serverOrigin);
  if (url.origin !== "https://www.strava.com" && url.origin !== new URL(serverOrigin).origin) throw new Error("The authorization destination could not be verified.");
  return url.toString();
}
