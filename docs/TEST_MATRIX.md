# Release test matrix

Phase 38, 2026-10-09. The root regression command passed **5,273 tests across 103 suites/files**. Separately, three production browser tests passed, covering all eleven required workflows, curated Portfolio persistence, narrow/keyboard navigation, and Node wire-driver rollback. No tests were skipped.

| Workspace | Passing tests |
| --- | ---: |
| Mobile | 63 |
| Web | 51 |
| Auth | 10 |
| Backup | 11 |
| Calculators | 6 |
| Database migrations/RLS | 8 |
| Education | 231 |
| Education memory | 227 |
| Feature registry | 9 |
| Finance | 88 |
| Finance memory | 35 |
| Health | 4,151 |
| Health memory | 295 |
| Planner | 4 |
| Portfolio | 10 |
| PostgreSQL repositories | 17 |
| Settings | 4 |
| Strava | 35 |
| Supabase repositories | 10 |
| Today | 3 |
| Validation | 5 |

Workspace type-checks passed. Strict lint passed after correcting provider child arguments; the original lint failure remains in the local log and affected checks were rerun. The Next.js production build emits 46 routes. Expo Doctor passes 21/21 and Android, iOS, and web exports pass. Export bundle sizes are approximately 5.1 MB Android, 4.8 MB iOS, and 2.5 MB web; Next's combined client JavaScript chunks total about 1.61 MB, not the bytes downloaded by each route. Native bundles were not run on devices.

The complete browser workflow recorded 200 REST reads and 16 writes. This includes repeated navigation, settings loads, owner-wide exports, and verification; it is not a production query-latency benchmark. There were no browser page errors or PostgreSQL concurrent-query warnings. Harmless Playwright CLI color-environment warnings remain in the harness log. The tested Portfolio text colors against white have contrast ratios 12.26, 5.91, 7.19, and 9.14; focus/touch/assistive-technology checks still require device review.

Tracked-file credential-pattern scanning inspected 1,140 source/config/documentation files with no findings. Scanning 47 generated client JavaScript files found no server-only credential variable names. Fifty Next dependency traces contained no braces, micromatch, or node-forge package files. The workspace audit still exits nonzero at 15 moderate/50 high/0 critical; the web production audit has 2 high findings despite those packages being absent from the resolved production graph/traces. See the security review for its limits.

| Layer | Coverage | Verification boundary |
| --- | --- | --- |
| Education | Models, calculations, services, lifecycle, memory/durable contracts, web/mobile workflows | Synthetic owners; domain and SQL tests |
| Health | All 11 declared calculations, reference inputs, 137 service methods, 22 repository interfaces, units and equipment usage | Synthetic records; no clinical recommendations or live provider |
| Finance | Exact decimal money, 38 plug-ins, assumptions, date/rate inputs, calculation references, service/repository/UI workflows | User-supplied financial/tax assumptions; no embedded current official rates |
| Auth | Owner allowlist, session lifecycle, callback safety, development bypass, native storage adapter | Synthetic provider and mocked secure storage; no hosted/device execution |
| SQL and Supabase adapters | Owner filtering, validation, pagination, network failures, sync state, transaction rollback | Isolated PGlite and SDK/REST contracts |
| Migrations and RLS | Ordered discovery, fresh/upgrade paths, grants, constraints, indexes, modern/legacy claims, owner isolation | Local PostgreSQL-compatible engine; no remote migration |
| Backup and recovery | Version migration, integrity, precision, owner/credential exclusions, stale confirmation, rollback, HTTP origin/body/rate limits | Real local service and transactional SQL; authenticated browser round trip |
| Registries | Manifest identity/routes/widgets, literal imports, calculator discovery, generic provider/server contributions and drift | Build-time source-controlled modules |
| Strava | State/token encryption, refresh, import idempotency, webhook queue, retries/backoff, disconnect | Mock/provider contracts; no live account |
| Portfolio | Strict curated projection, draft CAS, independent snapshot, public gate, safe URLs, backup never republishes | Package, web/mobile, and local SQL tests; public configuration remains off |
| Production browser E2E | Eleven required owner workflows, wrong accounts, narrow/keyboard navigation, Node wire-driver sequencing and rollback | Installed Chrome + production Next + synthetic Auth/REST + real local RLS |

## Reproduction

From the repository root, run `npm ci --ignore-scripts`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build --workspace @aperture/web`, and then `npm run test:e2e --workspace @aperture/e2e`. The E2E fixture uses only loopback ports 3100, 54331, and 54332 and fails if they are occupied. Chrome must be installed. It does not reuse a server, bypass production authentication, download a browser, or connect to a remote database. Failure screenshots/traces remain ignored local artifacts.

Run `npx expo-doctor` in `apps/mobile`, then `npm run export --workspace @aperture/mobile -- --platform all --output-dir .expo-release-check`. Exports are bundles, not native device executions. Audit with `npm audit`; a nonzero result is recorded rather than replaced by a forced upgrade.

Web tests use one worker thread to avoid import/startup timeouts observed when many jsdom workers competed with builds on this Windows host. Assertions and test coverage are unchanged. Strava's cold public import has the same 15-second startup budget as existing web workflows. Run builds/exports after the regression suite rather than loading the machine with concurrent bundlers.
