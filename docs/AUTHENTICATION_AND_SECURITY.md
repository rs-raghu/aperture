# Personal authentication and security

Phase 30 implements a private, single-owner access boundary with Supabase Auth.
Public registration is disabled in `supabase/config.toml`. The application
accepts only the normalized `APERTURE_OWNER_EMAIL` and, when configured, the
exact `APERTURE_OWNER_ID`. A provider session for any other account is cleared
before the application returns data.

## Web

Next.js uses `@supabase/ssr` on the server. The proxy refreshes Supabase cookies
and verifies the user with `auth.getUser()` before dashboard routes run. The
dashboard layout repeats the owner check as a server boundary. Sign-in and PKCE
callback handlers write the session through server cookie adapters; access and
refresh tokens are never added to application models, URLs, logs, or client
props.

Required web variables are listed in `apps/web/.env.example`. The service-role
key is not used by the authentication flow and must remain server-only.

## Mobile

Expo uses Supabase's PKCE flow with URL session detection disabled. The
`aperture://auth/callback` deep link is exchanged explicitly. Session envelopes
are persisted through `expo-secure-store` with device-only, after-first-unlock
keychain accessibility. AsyncStorage is not used for authentication tokens.
The root router prevents unauthenticated deep links from mounting feature
routes.

Authenticated web cookies and the mobile Supabase client are also the session
source for the Phase 31 data adapters. Repository requests carry the provider
access token internally; tokens are not copied into domain services or feature
state.

Required public mobile variables are listed in `apps/mobile/.env.example`.
Only the Supabase URL, publishable key, and owner allowlist identity are public;
service-role and integration credentials are forbidden in mobile variables.

## Development bypass

The bypass requires an explicit `APERTURE_AUTH_DEV_BYPASS=true` on web or
`EXPO_PUBLIC_APERTURE_AUTH_DEV_BYPASS=true` on mobile and a development runtime.
Requesting it in production, preview, or test mode throws a configuration
error. Without the flag, missing authentication configuration fails closed.

## Database enforcement

Personal tables grant CRUD access to the PostgreSQL `authenticated` role and no
access to `anon`. Existing owner policies compare `owner_id` with the verified
JWT subject. Tests execute queries as the restricted roles and confirm allowed
owner access, cross-owner write rejection, empty unauthenticated reads, and
anonymous permission denial.

The focused security suite also covers allowed and rejected accounts, missing
and expired sessions, refresh, logout, PKCE callback exchange, password update,
secure mobile storage, and production bypass rejection.
