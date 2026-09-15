# Aperture v2 execution ledger

This ledger is the resumable checkpoint for the continuous implementation mission in [MASTER_PLAN_PHASES_12_39.md](MASTER_PLAN_PHASES_12_39.md). Update it before and after every phase gate.

## Mission state

- Current phase: 17 — Health integration hardening
- Current phase status: implementation and Phase 16–17 pair gate complete; ready to commit
- Starting commit: `f90cb716093d1ead5435a02bbbf66cb0b12d2d39`
- Ending commit: `2f12da3` for Phase 16; Phase 17 pending
- Last successfully completed command: workspace and web-production dependency audits after the full Phase 16–17 gate
- Last push: `aa4eac4` pushed to `origin/codex/aperture-v2`; local and upstream matched after the Phase 14–15 pair
- Unresolved concern: supplemental Expo compatibility metadata requests patch updates to Expo, Expo Crypto, and Expo Router; the standard mobile checks pass and unrelated upgrades remain deferred until required by an applicable phase.

## Phase records

| Phase | Status | Commit | Focused verification | Full regression / pair gate | Dependencies / migrations | Known limitations and deferred work |
| ---: | --- | --- | --- | --- | --- | --- |
| 12 | Complete | `1c60ba7` | 4,115 tests / 5 files; lint, type-check, build pass | 4,639 tests / 26 suites or files; workspace type-check/lint/builds, Next production build, and Expo web export pass; Expo Doctor 20/21 at accepted patch-version baseline | Direct declaration of existing `decimal.js@10.6.0` / none | 11/11 declared calculations implemented; clinical interpretation and undeclared calculations excluded |
| 13 | Complete | `fdb2c32` | 4,150 tests / 6 files; strict lint, type-check, and build pass | 4,639 tests / 26 suites or files; workspace type-check/lint/builds, Next production build, and Expo web export pass; Expo Doctor 20/21 at accepted patch-version baseline; pushed | No new dependency / none | Complete lifecycle and summary inventory implemented as 137 distinct methods; repository adapters and UI deferred |
| 14 | Complete | `78dad26` | 294 tests / 4 files; strict lint, type-check, and build pass | 4,940 tests / 33 suites or files; workspace type-check/lint/builds, 21-page Next production build, and Expo web export pass; Expo Doctor 20/21 at accepted patch baseline | Local `@aperture/health@0.4.0` only / none | All 22 repository interfaces implemented; volatile storage only |
| 15 | Complete | `aa4eac4` | 15 tests / 7 files; web lint, type-check, and 21-page production build pass | 4,940 tests / 33 suites or files; workspace type-check/lint/builds, Next production build, and Expo web export pass; Expo Doctor 20/21 at accepted patch baseline; pushed | Local `@aperture/health@0.4.0` and `@aperture/health-memory@0.5.0` links / none | Volatile synthetic-owner web preview; no authentication or persistence |
| 16 | Complete | `2f12da3` | 31 mobile tests / 11 suites; mobile lint and type-check pass; Android, iOS, and web exports pass; Expo Doctor 20/21 at accepted patch baseline | 4,963 tests / 40 suites or files; workspace type-check/lint/builds, 21-page Next production build, and Expo all-platform export pass; Expo Doctor 20/21 at accepted patch baseline | Local `@aperture/health@0.4.0` and `@aperture/health-memory@0.5.0` links / none | Volatile synthetic-owner mobile preview; no Android runtime available, so native execution remains unverified |
| 17 | Ready to commit | Pending | 4,500 tests across Health, Health Memory, web, and mobile suites; applicable lint, type-check, and builds pass | 4,963 tests / 40 suites or files; workspace type-check/lint/builds, 21-page Next production build, and Expo Android/iOS/web export pass; Expo Doctor 20/21 at accepted patch baseline | No new dependency / none | Durable storage, authentication, native device execution, and integrations remain deferred |
| 18 | Not started | — | — | — | — | Finance models and validation |
| 19 | Not started | — | — | — | — | Finance calculation foundation |
| 20 | Not started | — | — | — | — | Investment and wealth calculators |
| 21 | Not started | — | — | — | — | Loan, income, tax, and economic calculators |
| 22 | Not started | — | — | — | — | Retirement and independence calculators |
| 23 | Not started | — | — | — | — | Finance services |
| 24 | Not started | — | — | — | — | Finance memory repositories |
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

- Files changed: absolute-instant comparison and duration precision, memory timestamp ordering/ranges, service-backed web hydration total, cross-platform error/status accessibility, hardening tests, and Health vertical-slice documentation
- Dependencies added: none
- Database migrations added: none
- Tests added: offset and nanosecond ordering/range/summary regression, exact workout duration, service-backed hydration parity, cross-platform repository-error normalization, explicit-zone input normalization, web route and control accessibility, mobile control announcement, virtualized list, and long-text coverage
- Focused verification result: Health 4,151 tests / 6 files, Health Memory 295 / 4, web 19 / 8, and mobile 35 / 12 pass; applicable lint, type-check, and builds pass
- Full regression result: 4,963 tests in 40 suites or files pass; all workspace type-checks and lint checks pass; applicable package builds and the 21-page Next production build pass; Expo Android, iOS, and web exports pass; Expo Doctor remains 20/21 only because of three documented patch-version mismatches
- Audit result: 13 moderate and 0 high/critical workspace findings in the accepted Expo dependency tree; web production audit reports 0 vulnerabilities. Neither audit timed out, and no forced dependency rewrite was applied.
- Known limitations: ADB is unavailable and native iOS execution is unavailable on Windows; Android and iOS results are JavaScript export checks, not native runs. Expo Doctor remains 20/21 only because of the three documented patch-version mismatches.
- Deferred work: Finance runtime implementation, durable repositories, persistence, authentication, integrations, and Phases 18–39
- Next phase: 18 after the Phase 16–17 pair gate, commit, and push
