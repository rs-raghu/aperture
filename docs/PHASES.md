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

## Phase 7 — Education services and use cases: complete after verification

The dependency-injected Education application layer implements 79 owner-scoped workflows and six high-level summaries. IDs and timestamps come from injected contracts; storage remains behind interfaces.

## Phase 7 exclusions

Production repositories, databases, SQL, Supabase, APIs, authentication, UI, navigation, notifications, synchronization, imports/exports, background jobs, Health/Finance services, and new calculations remain unimplemented.

## Phase 8 — Education memory repositories: complete after verification

The isolated `@aperture/education-memory` workspace implements all fourteen Education repository interfaces with owner-scoped, defensively cloned, deterministic, process-local storage. Contract, query, aggregate, public-import, and real-service integration tests verify the adapter.

## Phase 8 exclusions

Durable storage, Supabase, PostgreSQL, SQL, ORM code, browser/device persistence, APIs, authentication, synchronization, import/export, backup/restore, notifications, UI, Health/Finance repositories, production seeds, and Phase 9 work remain unimplemented.

## Phase 9 — Education web preview: complete after verification

The Next.js workspace now provides an Education-only local development preview. Eight App Router URLs compose feature-local screens over the real dependency-injected Education service and isolated memory adapter. Empty-state setup, courses, assignments, exams, grades, attendance, study sessions, summaries, accessible errors, and responsive navigation are implemented and tested.

## Phase 9 exclusions

Durable persistence, Supabase, SQL, APIs, authentication/authorization, production owner sessions, the complete Aperture shell, Education mobile UI, Health/Finance UI, import/export, backup/restore, notifications, calendar/email integrations, analytics, deployment, and Phase 10 work remain unimplemented.

## Phase 10 — Education mobile preview: complete after verification

The Expo workspace now provides an Education-only React Native development preview. Eight Expo Router URLs compose mobile-native screens over the real dependency-injected Education service and isolated memory adapter. Setup, courses, assignments, exams, grades, attendance, study sessions, summaries, accessible errors, mobile navigation, and responsive phone layouts are implemented and tested.

## Phase 10 exclusions

Durable persistence, AsyncStorage data storage, SQLite, Supabase, SQL, APIs, authentication/authorization, production sessions, biometrics, the complete mobile shell, Health/Finance UI, synchronization, notifications, calendar integrations, deployment, store packaging, publishing, and Phase 11 work remain unimplemented.

## Phase 11 — not started

Phase 11 has not been authorized or started. No additional implementation scope is implied.

## Implementation status

Education models, shared validation, seven calculations, the injected Education application layer, the volatile memory adapter, and local Education web/mobile previews have runtime implementations. Durable storage and other domain/application behavior remain structural or interface-only.
