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

## Server-only

| Variable | Future purpose |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server access. Never expose to browsers or mobile bundles. |
| `APERTURE_OWNER_EMAIL` | Future private-owner bootstrap configuration. |
| `STRAVA_CLIENT_ID` | Future server-side provider identifier. |
| `STRAVA_CLIENT_SECRET` | Future server-side provider secret. |
| `STRAVA_REDIRECT_URI` | Future server-side callback configuration. |

Service-role keys and integration credentials must never use public prefixes or appear in the mobile example.

## Local development

Developers will create ignored local files only in an approved implementation phase. `.env`, `.env.local`, and other real environment variants remain ignored. Committed `.env.example` files contain names and comments only.

## Hosted environments

Vercel, Expo/EAS, and Supabase will hold environment-specific values in their managed secret/configuration systems when deployment is separately approved. No hosted value, project identifier, or credential is configured in Phase 4.
