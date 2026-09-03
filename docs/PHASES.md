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

## Phase 5 — Education models and validation: complete after verification

All 14 Education entities now have strict runtime Zod schemas for stored entities, create inputs, update inputs, and queries. Shared Validation implements typed result and error-normalization helpers. Synthetic model/validation tests and model-only production builds verify the boundary.

## Phase 5 exclusions

Education calculations, operation implementations, repositories, services, UI, APIs, authentication, database access, Supabase, navigation, import/export, notifications, synchronization, and application behavior remain unimplemented.

## Phase 6 — Education calculations: complete after verification

The seven Education calculations are implemented as validated, deterministic, decimal-safe pure functions with explicit policies and rounding metadata.

## Phase 6 exclusions

CRUD operations, repository and service implementations, Health and Finance calculations, UI, APIs, authentication, persistence, Supabase, SQL, navigation, imports, notifications, and application behavior remain unimplemented.

## Phase 7 — not started

Phase 7 has not been authorized or started. No additional implementation scope is implied.

## Implementation status

Only Education models, shared structural validation, and the seven Education calculations have runtime implementations. All other domain and application behavior remains structural or declaration-only.
