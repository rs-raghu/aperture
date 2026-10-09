# Deployment readiness and operator runbook

Phase 39 prepares deployment artifacts for the existing Next.js API, Supabase database/Auth, and Expo/EAS applications. No separate FastAPI service or duplicate production API is needed. No remote project was linked, migrated, deployed, or published during implementation.

## Local release preparation

Run the checks in [TEST_MATRIX.md](TEST_MATRIX.md), review the nonzero dependency audit in [SECURITY_REVIEW.md](SECURITY_REVIEW.md), then run:

```text
npm run deployment:prepare
npm run deployment:check
```

The staging tool discovers all 14 core and feature-owned migrations in timestamp order and writes an ignored `.deployment/supabase` project plus a SHA-256 migration plan. It contacts no database, leaves source migrations unchanged, refuses symbolic links, and rejects altered or unregistered staged SQL. Preserve any linked project information before preparing a fresh local staging directory after source changes. The generated config retains local URLs; production Auth/API settings must be applied to the verified project separately.

## Verify the deployment identity first

Record the owner's Vercel team/project, Supabase project reference/database, canonical HTTPS domain, owner Auth UUID/email, and EAS project/application identifiers in a private operator record. Compare the selected host projects and migration history with that record before any write. This mission authorizes configuration and verified permitted deployment; it does not authorize deployment to an unknown existing project, purchases, destructive remote resets, app-store submission, or automatic Portfolio publication.

No production environment files, Vercel linkage, or relevant hosting credentials were present locally. The smallest external step is selecting the owned targets and configuring the variables from [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) in their managed environments. Secrets stay out of chat, shell arguments, source control, and logs.

## Supabase migration and Auth procedure

After confirming the project reference, authenticate with the CLI's secure login flow and use the staged project:

```text
supabase --workdir .deployment link --project-ref <VERIFIED_PROJECT_REF>
supabase --workdir .deployment migration list --linked
supabase --workdir .deployment db push --linked --dry-run
```

Review the pending versions against `.deployment/migration-plan.json`, take a provider database snapshot and owner archive, and only then execute:

```text
supabase --workdir .deployment db push --linked
```

Do not run a remote reset, drop tables, rewrite applied migration files, repair history to hide divergence, or include the synthetic seed. These commands were documented, not executed against a remote target. Supabase applies pending migrations according to its history; the dry-run lists intended migrations. [Supabase CLI reference](https://supabase.com/docs/reference/cli/supabase-db-push)

Configure exposed API schemas to `public, education, health, finance, platform, planner, portfolio`; preserve anonymous denial, owner RLS, and credential revocations. Create the allowlisted owner through the approved admin process, disable public signup, keep email verification enabled, and verify the UUID matches both apps. Set the Auth site URL to the canonical domain and allow exact `https://<OWNED_DOMAIN>/auth/callback` plus `aperture://auth/callback` for the approved native application. Avoid wildcard production redirects. The checked-in local config does not apply these hosted settings automatically.

Keep `auth.enable_signup = false` and `auth.email.enable_signup = true`. The global setting blocks public registration while the email provider remains available for the manually provisioned owner. During hosted setup with CLI 2.120.0, setting both false also disabled email/password login (`external.email = false` from `/auth/v1/settings`). Verify the hosted endpoint reports signup disabled and email enabled before testing owner login. The application still enforces its separate email/UUID allowlist.

## Vercel web procedure

Use `apps/web` as Root Directory and permit workspace files outside it during the monorepo build. `apps/web/vercel.json` selects Next.js, `npm ci --ignore-scripts`, `npm run build`, and private deployment logs/source visibility. Set a supported Node 24 runtime and configure the owned HTTPS domain. Supply the production template values in the correct preview/production environment before building. The optional features remain disabled unless their owner-controlled setup is complete. [Vercel configuration](https://vercel.com/docs/project-configuration)

Recovery runs on Node with a 60-second function budget; readiness uses 30 seconds. Remote database connections verify TLS, connection establishment is limited to ten seconds, and individual queries/statements to twenty seconds. Configure provider/edge limits for Auth, recovery, and public webhook ingress; per-process counters do not coordinate multiple instances.

The Node database driver includes the public Supabase Root 2021 CA for hosted Supabase pooler/direct database hostnames, so verified database connections work in the setup script and Vercel without changing machine-wide trust. Certificate-chain and hostname verification remain enabled, and connection URL SSL switches cannot override them. The certificate's official download source, SHA-256 fingerprint, and expiry are recorded in `packages/postgres-repositories/src/supabase-ca.ts`; review and update it when Supabase rotates its database CA.

Vercel's documented request/response limit is 4.5 MB, below the application's 8 MiB recovery-envelope ceiling. A hosted recovery request must fit the lower limit, including JSON escaping/envelope overhead. Larger archives need an owner-operated PostgreSQL recovery procedure on a verified trusted host; do not split an atomic replacement into independent REST writes or upload plaintext backups publicly. [Vercel function limits](https://vercel.com/docs/functions/limitations)

## Expo/EAS procedure

The native scheme is fixed to `aperture`. `app.config.ts` reads the owner-selected Android/iOS identifiers and EAS UUID without inventing them; production environment checks require all three. `eas.json` defines an internal preview APK/iOS simulator profile and a production profile, both rejecting the auth bypass. Profiles do not submit to stores or purchase anything. Native branding/store artwork, signing ownership, build-number increments, and legal/store metadata require the owner's verified release setup.

With the verified account, identifiers, environment values, and signing choices configured, review the effective Expo config and run the approved build:

```text
npx expo config --type public
eas build --profile preview --platform android
eas build --profile production --platform all
```

No EAS cloud build or signing operation was executed here. EAS must include this monorepo and build the local workspace packages before Metro; the mobile package's `eas-build-post-install` hook invokes its existing shared-package build chain. Inspect the cloud build logs and use the same root lockfile. [EAS build profiles](https://docs.expo.dev/build/eas-json/), [EAS lifecycle hooks](https://docs.expo.dev/build-reference/npm-hooks/)

## Installation and operations

The web manifest and SVG icon enable a standalone installation shell without a service worker or private-record cache. They contain no owner data and do not enable offline writes. Mobile and installed web still require network access for synchronized records.

`GET /api/health` is public liveness only. `GET /api/health/ready` requires verified owner authentication and checks the configured transactional database with `SELECT 1`; neither response contains configuration values or records. Operational JSON logs contain only a fixed event code, level, UTC timestamp, and random event ID. The injectable monitoring factory accepts the same fixed schema; no external monitoring SDK or transport is connected by default.

Complete [POST_DEPLOYMENT_SMOKE_TESTS.md](POST_DEPLOYMENT_SMOKE_TESTS.md) on the actual host and devices. Use [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md) for backup, rollback, and recovery; a failed or timed-out write requires a fresh preview and record verification before retrying.
