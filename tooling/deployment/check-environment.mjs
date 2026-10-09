import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function https(value, originOnly = false) {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash && !["localhost", "127.0.0.1"].includes(url.hostname) && !url.hostname.endsWith(".invalid") && (!originOnly || url.pathname === "/"); } catch { return false; }
}
function publicKey(value) {
  if (value?.startsWith("sb_publishable_")) return true;
  try { return JSON.parse(Buffer.from(value.split(".")[1], "base64url").toString("utf8")).role === "anon"; } catch { return false; }
}
export function inspectProductionEnvironment(target, environment) {
  if (!["web", "mobile"].includes(target)) throw new Error("Select web or mobile.");
  const issues = []; const required = (name, valid = (value) => value.length > 0) => { const value = environment[name]?.trim() ?? ""; if (!valid(value)) issues.push(name); return value; };
  const prefix = target === "web" ? "NEXT_PUBLIC_" : "EXPO_PUBLIC_";
  required(`${prefix}SUPABASE_URL`, https); required(`${prefix}SUPABASE_PUBLISHABLE_KEY`, publicKey);
  const ownerPrefix = target === "web" ? "APERTURE_" : "EXPO_PUBLIC_APERTURE_";
  required(`${ownerPrefix}OWNER_ID`, (value) => uuid.test(value)); required(`${ownerPrefix}OWNER_EMAIL`, (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)); required(`${ownerPrefix}AUTH_DEV_BYPASS`, (value) => value === "false");
  if (target === "mobile") {
    required("EXPO_PUBLIC_APP_SCHEME", (value) => value === "aperture"); required("EXPO_PUBLIC_APERTURE_WEB_URL", (value) => https(value, true));
    required("APERTURE_ANDROID_PACKAGE", (value) => /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*){2,}$/.test(value)); required("APERTURE_IOS_BUNDLE_IDENTIFIER", (value) => /^[A-Za-z][A-Za-z0-9-]*(?:\.[A-Za-z][A-Za-z0-9-]*){2,}$/.test(value)); required("APERTURE_EAS_PROJECT_ID", (value) => uuid.test(value));
  } else {
    const origin = required("APERTURE_WEB_ORIGIN", (value) => https(value, true)); required("NEXT_PUBLIC_APP_ORIGIN", (value) => value === origin && https(value, true)); required("APERTURE_RECOVERY_ENABLED", (value) => value === "true");
    required("DATABASE_URL", (value) => { try { const url = new URL(value); return ["postgres:", "postgresql:"].includes(url.protocol) && !["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) && !!url.username && !!url.password; } catch { return false; } });
    const publicPortfolio = required("APERTURE_PORTFOLIO_PUBLIC", (value) => ["true", "false"].includes(value)); if (publicPortfolio === "true") required("SUPABASE_SERVICE_ROLE_KEY");
    const strava = required("APERTURE_STRAVA_MODE", (value) => ["disabled", "live"].includes(value));
    if (strava === "live") {
      required("STRAVA_CLIENT_ID", (value) => /^\d+$/.test(value)); required("STRAVA_CLIENT_SECRET"); required("STRAVA_WEBHOOK_VERIFY_TOKEN"); required("STRAVA_WEBHOOK_SUBSCRIPTION_ID", (value) => /^[1-9]\d*$/.test(value));
      required("STRAVA_REDIRECT_URI", (value) => value === `${origin}/api/integrations/strava/callback`);
      required("STRAVA_TOKEN_ENCRYPTION_KEY", (value) => { const key = Buffer.from(value, "base64"); return key.byteLength === 32 && key.toString("base64") === value; });
    }
  }
  return { target, valid: issues.length === 0, invalidVariables: [...new Set(issues)] };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = inspectProductionEnvironment(process.argv.includes("--mobile") ? "mobile" : "web", process.env); console.info(JSON.stringify(result)); if (!result.valid) process.exitCode = 1; }
  catch { console.error("Production environment validation failed; no values were logged."); process.exitCode = 1; }
}
