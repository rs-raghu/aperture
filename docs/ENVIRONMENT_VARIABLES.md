# Environment-variable inventory

Phase 4 records names and classifications only. The example files contain no values, and application code does not read variables.

## Public web

| Variable | Future purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project endpoint. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public browser-safe publishable key. |
| `NEXT_PUBLIC_APP_ORIGIN` | Canonical public web origin. |

## Public mobile

| Variable | Future purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Public Supabase project endpoint. |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public mobile-safe publishable key. |
| `EXPO_PUBLIC_APP_SCHEME` | Mobile deep-link scheme. |
| `EXPO_PUBLIC_APERTURE_WEB_URL` | Owned HTTPS web server origin for authenticated Strava API requests. Contains no integration secret. |

## Server-only

| Variable | Future purpose |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server access. Never expose to browsers or mobile bundles. |
| `APERTURE_OWNER_EMAIL` | Future private-owner bootstrap configuration. |
| `APERTURE_OWNER_ID` | Allowlisted owner UUID; required for live Strava server composition. |
| `APERTURE_STRAVA_MODE` | `disabled` by default, development-only `mock`, or configured `live`. |
| `APERTURE_WEB_ORIGIN` | Fixed trusted web Origin and Strava callback completion destination. |
| `DATABASE_URL` | Server-only PostgreSQL connection for transactional integration storage. |
| `STRAVA_CLIENT_ID` | Server-side provider application identifier. |
| `STRAVA_CLIENT_SECRET` | Server-side provider secret. |
| `STRAVA_REDIRECT_URI` | Registered server-side OAuth callback URI. |
| `STRAVA_TOKEN_ENCRYPTION_KEY` | 32-byte canonical-base64 secret key for owner-bound AES-GCM token envelopes. |
| `STRAVA_WEBHOOK_VERIFY_TOKEN` | Server-held webhook challenge verification secret. |
| `STRAVA_WEBHOOK_SUBSCRIPTION_ID` | Assigned subscription identifier, checked on every delivery. |
| `APERTURE_PORTFOLIO_PUBLIC` | Explicit operator publication gate; false by default. Requires a separately prepared curated snapshot, fixed owner UUID, and canonical HTTPS origin. |

Service-role keys and integration credentials must never use public prefixes or appear in the mobile example.

## Local development

Developers will create ignored local files only in an approved implementation phase. `.env`, `.env.local`, and other real environment variants remain ignored. Committed `.env.example` files contain names and comments only.

## Hosted environments

Vercel, Expo/EAS, and Supabase will hold environment-specific values in their managed secret/configuration systems when deployment is separately approved. No hosted value, project identifier, or credential is configured in Phase 4.
