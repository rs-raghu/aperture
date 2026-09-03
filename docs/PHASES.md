# Aperture v2 phases

This plan records structural boundaries, not implementation promises. Work beyond an explicitly approved phase remains uncommitted scope.

## Phase 1 — Education domain skeleton: structurally complete

The `@aperture/education` entity, repository, service, calculation, and export contracts are structurally complete and remain unchanged through Phase 4 verification.

## Phase 2 — Health domain skeleton: structurally complete

The `@aperture/health` Health, Fitness, Workout, and Running contracts and explicit unit conventions are structurally complete and remain unchanged through Phase 4 verification.

## Phase 3 — Finance domain skeleton: structurally complete

The declaration-only `@aperture/finance` package now describes financial records, storage-independent repositories, orchestration summaries, and 36 calculator contracts. Every Finance source file is a `.d.ts` declaration and contains no runtime behavior.

## Phase 3 exclusions

Phase 3 excludes arithmetic, formulas, tax and government rules, current rates, recommendations, currency conversion, accounting effects, matching or import logic, market/banking/brokerage integrations, UI, APIs, authentication, persistence, migrations, validation, mock/seed data, and behavior tests.

## Phase 4 — platform skeleton: structurally complete

The web and mobile workspace manifests, route inventories, shared platform contract packages, future Supabase organization, environment inventory, test organization, and deployment target documentation are structurally complete. All new shared package source files are `.d.ts` declarations.

## Phase 4 exclusions

Phase 4 excludes executable pages, screens, components, routes, handlers, middleware, authentication behavior, Supabase clients, repositories, SQL, policies, formulas, validation behavior, import/export behavior, integration behavior, tests, application builds, launches, deployment, secrets, mock data, and seed data.

## Phase 5 — not started

Phase 5 has not been authorized or started. No work beyond the approved Phase 4 inventory is implied.

## Implementation status

No implementation phase has started. Phases 1–4 define structural contracts and platform boundaries only and make no delivery promises beyond their approved inventories.
