# Phase 4 platform skeleton

Phase 4 establishes future application and platform boundaries. It does not provide a runnable application.

## Applications

### `apps/web`

The `@aperture/web` workspace reserves a Next.js App Router application. Its configuration files contain only TypeScript/tool metadata, while `src/contracts` describes the future application, route, session, navigation, environment, and error boundaries. Every reserved route directory contains documentation instead of `page.tsx`, `layout.tsx`, `route.ts`, middleware, components, handlers, or server actions.

### `apps/mobile`

The `@aperture/mobile` workspace reserves an Expo Router and React Native application. `app.json` contains placeholder, non-secret metadata. Its contract declarations describe the future application, route, session, navigation, storage, environment, and error boundaries. Reserved routes contain documentation instead of executable screens, layouts, hooks, or components.

## Shared packages

| Package | Responsibility |
| --- | --- |
| `@aperture/platform-contracts` | Framework-neutral auth, session, user, preference, navigation, notification, synchronization, data-portability, and integration contracts. |
| `@aperture/data-access` | Storage-neutral clients, owner context, repositories, queries, mutations, pagination, subscriptions, and transaction abstractions. |
| `@aperture/validation` | Provider-neutral validation results, issues, error normalization, and declaration signatures. |
| `@aperture/calculators` | A registry and saved-scenario coordination surface for existing Education and Finance calculators; it contains no formula contracts duplicated from those domains. |
| `@aperture/formatting` | Locale-aware formatting signatures for currency, decimals, percentages, dates, date-times, durations, distances, weights, and pace. |
| `@aperture/config` | Explicit public-web, public-mobile, server-only, Supabase, feature-flag, integration, environment, and configuration-validation shapes. |
| `@aperture/feature-registry` | Static modular-monolith metadata contracts for Today, Education, Health, Finance, Calculators, and Settings. It is not a runtime plugin system. |

All source files in these shared packages are `.d.ts` declarations. They contain no function bodies.

## Responsibility boundaries

- Education, Health, and Finance retain ownership of domain entities, repository contracts, services, and calculation contracts.
- Web owns future browser and Next.js composition, but it does not own domain rules.
- Mobile owns future React Native and device composition, but it does not own domain rules.
- Shared packages cannot import application code.
- `data-access` stays provider-neutral; a future Supabase adapter must remain outside its generic contracts.
- Validation contracts do not choose a validation library.
- Configuration types distinguish public values from server-only secrets. No environment reader exists yet.
- Privileged operations will use future Next.js Route Handlers or Supabase Edge Functions; no separate backend server is planned.

## Authentication and ownership boundary

Supabase Auth is the future identity provider. Phase 4 defines authentication and session signatures only. Public signup is intended to be disabled. Owner identifiers remain structural placeholders until authentication and storage are implemented. All future personal-data tables require owner-based Row Level Security.

## Backend and data-access strategy

Supabase PostgreSQL is the planned system of record. Database implementation begins no earlier than Phase 26. Phase 4 creates directory organization only: no SQL, migration, policy, client, query, repository implementation, or transaction behavior exists.

## Future implementation sequence

A separately approved implementation plan may introduce configuration readers and validation, authentication adapters, owner-scoped data adapters, minimal application shells, feature-by-feature routes, portability operations, integrations, and deployment automation. This ordering is context, not an implementation promise.

## Phase 4 exclusions

Phase 4 excludes executable UI, route handlers, middleware, server actions, API requests, authentication behavior, Supabase clients, repositories, SQL, RLS policies, formulas, validation behavior, import parsing, backup/restore/deletion behavior, provider OAuth, notifications, synchronization, offline caching, tests, deployment, secrets, and mock or seed data.
