# Environment variables

Local examples are `apps/web/.env.example` and `apps/mobile/.env.example`. Production templates are `.env.production.example` in each app. Values stay in ignored local files or the verified hosting project's configuration; never commit populated examples.

## Web public configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Owned Supabase API endpoint; HTTPS in production. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key or legacy anon key; never a privileged key. |
| `NEXT_PUBLIC_APP_ORIGIN` | Canonical HTTPS web origin, matching the server origin. |

## Web server configuration

| Variable | Purpose |
| --- | --- |
| `APERTURE_OWNER_EMAIL` | Fixed allowlisted account email, verified through Supabase Auth. |
| `APERTURE_OWNER_ID` | Fixed Supabase owner UUID; required for the production release and integrations. |
| `APERTURE_AUTH_DEV_BYPASS` | Explicit false in production. True is allowed only in development with synthetic memory data. |
| `APERTURE_WEB_ORIGIN` | Fixed trusted HTTPS Origin for recovery and integration completion. |
| `APERTURE_RECOVERY_ENABLED` | True in the production template to enable reviewed recovery; false in the local default. |
| `DATABASE_URL` | Server-only PostgreSQL connection for atomic recovery, integration storage, and readiness. Remote connections verify TLS certificates; URL SSL switches cannot disable verification. |
| `APERTURE_PORTFOLIO_PUBLIC` | False by default. Public publication additionally requires an independently prepared curated snapshot and valid owner/origin configuration. |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-only key used by the optional public Portfolio projection. Unneeded while publication is off. |
| `APERTURE_STRAVA_MODE` | Disabled by default; live requires all provider configuration. Mock is rejected in production. |
| `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` | Owner-held provider application credentials. |
| `STRAVA_REDIRECT_URI` | Exact owned HTTPS `/api/integrations/strava/callback` registration. |
| `STRAVA_TOKEN_ENCRYPTION_KEY` | Canonical base64 encoding of exactly 32 random bytes; keep recoverable in the owner's secret vault. |
| `STRAVA_WEBHOOK_VERIFY_TOKEN`, `STRAVA_WEBHOOK_SUBSCRIPTION_ID` | Provider challenge secret and approved subscription identifier. |

Use the provider's server connection/pooler configuration for the verified project. Pool sizes are one for recovery, one for readiness, and three for live Strava per server process; account for multiple instances. Individual driver statements/queries and connections are bounded. If a custom trust root is necessary, configure the platform trust store rather than disabling TLS verification.

## Mobile public and build configuration

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same owned project and publishable key as the web app. |
| `EXPO_PUBLIC_APERTURE_OWNER_EMAIL`, `EXPO_PUBLIC_APERTURE_OWNER_ID` | Explicit owner allowlist used by the client; these values can be extracted from the app bundle and must never be credentials. The server independently verifies identity. |
| `EXPO_PUBLIC_APERTURE_AUTH_DEV_BYPASS` | Explicit false for builds/exports intended for release. |
| `EXPO_PUBLIC_APP_SCHEME` | `aperture`; matches the configured native scheme. |
| `EXPO_PUBLIC_APERTURE_WEB_URL` | Owned HTTPS web origin for bearer-authenticated recovery and Strava requests. |
| `APERTURE_ANDROID_PACKAGE` | Owner-selected Android application identifier, evaluated during Expo configuration. |
| `APERTURE_IOS_BUNDLE_IDENTIFIER` | Owner-selected iOS bundle identifier. |
| `APERTURE_EAS_PROJECT_ID` | Verified EAS project UUID. No project is created automatically. |

EAS identifiers are build configuration, not integration secrets. Native auth sessions use SecureStore. Public Expo variables are embedded at build/export time; change them by rebuilding the artifact. The build checker requires both native application identifiers even when validating only one platform.

## Local and hosted validation

With values already loaded into the process environment, run `npm run deployment:env` for web or `npm run deployment:env -- --mobile` for mobile. The checker reports invalid variable names only and rejects production bypasses, mock integration mode, insecure endpoints, missing release recovery, and privileged keys in public configuration. It validates structure without contacting the provider or proving ownership; target identity and session/database smoke tests remain required.

No Vercel linkage, hosted environment values, Supabase credentials, or EAS project identity were available during this mission. Configure them in the verified owner's managed settings before deployment. Do not paste passwords, service keys, OAuth tokens, or connection URLs into reports or command arguments.
