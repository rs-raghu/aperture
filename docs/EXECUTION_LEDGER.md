# Aperture v2 execution ledger

This ledger is the resumable checkpoint for the continuous implementation mission in [MASTER_PLAN_PHASES_12_39.md](MASTER_PLAN_PHASES_12_39.md). Update it before and after every phase gate.

## Mission state

- Current phase: 24 — Finance memory repositories
- Current phase status: focused verification complete; commit pending
- Starting commit: `f90cb716093d1ead5435a02bbbf66cb0b12d2d39`
- Ending commit: `2a0dcb9` (Phase 23); Phase 24 commit pending
- Last successfully completed command: `npm test --workspace @aperture/finance-memory` (35/35 tests)
- Last push: `2a0dcb9` pushed to `origin/codex/aperture-v2`; local and upstream matched after the push
- Unresolved concern: supplemental Expo compatibility metadata requests patch updates to Expo, Expo Crypto, and Expo Router; the standard mobile checks pass and unrelated upgrades remain deferred until required by an applicable phase.

## Phase records

| Phase | Status | Commit | Focused verification | Full regression / pair gate | Dependencies / migrations | Known limitations and deferred work |
| ---: | --- | --- | --- | --- | --- | --- |
| 12 | Complete | `1c60ba7` | 4,115 tests / 5 files; lint, type-check, build pass | 4,639 tests / 26 suites or files; workspace type-check/lint/builds, Next production build, and Expo web export pass; Expo Doctor 20/21 at accepted patch-version baseline | Direct declaration of existing `decimal.js@10.6.0` / none | 11/11 declared calculations implemented; clinical interpretation and undeclared calculations excluded |
| 13 | Complete | `fdb2c32` | 4,150 tests / 6 files; strict lint, type-check, and build pass | 4,639 tests / 26 suites or files; workspace type-check/lint/builds, Next production build, and Expo web export pass; Expo Doctor 20/21 at accepted patch-version baseline; pushed | No new dependency / none | Complete lifecycle and summary inventory implemented as 137 distinct methods; repository adapters and UI deferred |
| 14 | Complete | `78dad26` | 294 tests / 4 files; strict lint, type-check, and build pass | 4,940 tests / 33 suites or files; workspace type-check/lint/builds, 21-page Next production build, and Expo web export pass; Expo Doctor 20/21 at accepted patch baseline | Local `@aperture/health@0.4.0` only / none | All 22 repository interfaces implemented; volatile storage only |
| 15 | Complete | `aa4eac4` | 15 tests / 7 files; web lint, type-check, and 21-page production build pass | 4,940 tests / 33 suites or files; workspace type-check/lint/builds, Next production build, and Expo web export pass; Expo Doctor 20/21 at accepted patch baseline; pushed | Local `@aperture/health@0.4.0` and `@aperture/health-memory@0.5.0` links / none | Volatile synthetic-owner web preview; no authentication or persistence |
| 16 | Complete | `2f12da3` | 31 mobile tests / 11 suites; mobile lint and type-check pass; Android, iOS, and web exports pass; Expo Doctor 20/21 at accepted patch baseline | 4,963 tests / 40 suites or files; workspace type-check/lint/builds, 21-page Next production build, and Expo all-platform export pass; Expo Doctor 20/21 at accepted patch baseline | Local `@aperture/health@0.4.0` and `@aperture/health-memory@0.5.0` links / none | Volatile synthetic-owner mobile preview; no Android runtime available, so native execution remains unverified |
| 17 | Complete | `970ff40` | 4,500 tests across Health, Health Memory, web, and mobile suites; applicable lint, type-check, and builds pass | 4,963 tests / 40 suites or files; workspace type-check/lint/builds, 21-page Next production build, and Expo Android/iOS/web export pass; Expo Doctor 20/21 at accepted patch baseline; pushed | No new dependency / none | Durable storage, authentication, native device execution, and integrations remain deferred |
| 18 | Complete | `50b0e0b` | 27 tests / 2 files; generated-surface check, strict lint, type-check, and build pass | 5,011 tests / 43 suites or files; workspace type-check/lint, Finance build, 21-page Next production build, Expo Android/iOS/web exports pass; Expo Doctor 20/21 at accepted patch baseline | Existing local `@aperture/validation@0.5.0` / none | 281 data schemas, 30 repository contracts, and 183 operations inventoried |
| 19 | Complete | `d5338d9` | 48 Finance tests / 3 files; strict lint, type-check, and build pass | 5,011 tests / 43 suites or files; workspace type-check/lint, Finance build, 21-page Next production build, Expo Android/iOS/web exports pass; Expo Doctor 20/21 at accepted patch baseline; pushed | Direct declaration of existing `decimal.js@10.6.0` / none | Calculator-specific wrappers, manifests, and presentations remain Phase 20–22 and 25–26 work |
| 20 | Complete | `4bf2cdc` | 58 Finance tests / 4 files; generated registry check, strict lint, type-check, and build pass | 5,035 tests / 45 suites or files; workspace type-check/lint, Finance build, 21-page Next production build, Expo Android/iOS/web exports pass; Expo Doctor 20/21 at accepted patch baseline | No new dependency / none | 18 independent calculator plug-ins; government schemes require user-supplied assumptions and ship without rate presets |
| 21 | Complete | `cfe9e36` | 72 Finance tests / 5 files; generated registries and schemas, strict lint, type-check, and build pass | 5,035 tests / 45 suites or files; workspace type-check/lint, Finance build, 21-page Next production build, Expo Android/iOS/web exports pass; Expo Doctor 20/21 at accepted patch baseline; pushed | No new dependency / none | Tax and HRA rules remain caller-supplied and effective-dated; no timeless official-rule presets are embedded |
| 22 | Complete | `55e3b86` | 83 Finance tests / 6 files; generated registries and schemas, strict lint, type-check, and build pass | 5,051 tests / 47 suites or files; workspace type-check/lint, Finance build, 21-page Next production build, Expo Android/iOS/web exports pass; Expo Doctor 20/21 at accepted patch baseline | No new dependency / none | Six retirement plug-ins; government rules have no embedded current presets and remain caller-supplied, versioned, and effective-dated |
| 23 | Complete | `2a0dcb9` | 88 Finance tests / 7 files; strict lint, type-check, build, and generated checks pass | 5,051 tests / 47 suites or files; workspace type-check/lint, Finance build, 21-page Next production build, Expo Android/iOS/web exports pass; Expo Doctor 20/21 at accepted patch baseline; pushed | No new dependency / none | Repository-only service; favorites and recent calculators remain absent because no repository contracts declare them |
| 24 | Complete; commit pending | — | 35 Finance Memory tests / 4 files; strict lint, type-check, build, public import, and Finance generated checks pass | Pair gate runs after Phase 25 | Local `@aperture/finance@0.4.0` and `@aperture/validation@0.5.0` links / none | Volatile storage only; cursor continuity intentionally ends after any mutation |
| 25 | Not started | — | — | — | — | Finance web and Calculator Hub |
| 26 | Not started | — | — | — | — | Finance mobile |
| 27 | Not started | — | — | — | — | Finance vertical-slice hardening |
| 28 | Not started | — | — | — | — | PostgreSQL/Supabase schema and migrations |
| 29 | Not started | — | — | — | — | Durable repository adapters |
| 30 | Not started | — | — | — | — | Personal authentication and RLS security |
| 31 | Not started | — | — | — | — | Shared web/mobile data and synchronization |
| 32 | Not started | — | — | — | — | Modular dashboard shell and generated registries |
| 33 | Not started | — | — | — | — | Today and Planner vertical slices |
| 34 | Not started | — | — | — | — | Settings and privacy controls |
| 35 | Not started | — | — | — | — | Export, import, backup, and restoration |
| 36 | Not started | — | — | — | — | Optional Strava integration |
| 37 | Not started | — | — | — | — | Professional portfolio |
| 38 | Not started | — | — | — | — | Release hardening |
| 39 | Not started | — | — | — | — | Deployment readiness and permitted deployment |

## Current phase details

- Files changed: new Finance Memory package, account and transaction currency query declarations, generated runtime query schemas, deterministic fixtures and repository contracts, integration tests, package lock, documentation, and this ledger
- Dependencies added: local `@aperture/finance@0.4.0` and `@aperture/validation@0.5.0` workspace links
- Database migrations added: none
- Tests added: all 26 repository surfaces; CRUD; owner isolation; factory isolation; defensive cloning; exact decimal strings; deterministic ordering; pagination and stale cursors; account, category, currency, and date filtering; invalid entities and queries; and real Finance service integration
- Focused verification result: 35/35 Finance Memory tests pass; strict lint, type-check, build, public import, and Finance generated checks pass
- Full regression result: deferred to the required Phase 24–25 pair gate
- Audit result: 13 moderate workspace Expo-chain findings and 0 production-web findings
- Known limitations: the adapter is volatile and mutation-sensitive cursors deliberately reject continuation after a write
- Deferred work: Finance web/mobile UI, durable storage, platform integration, and Phases 25–39
- Next phase: 25 after the Phase 24 commit
