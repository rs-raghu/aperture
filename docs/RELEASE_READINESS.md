# Release readiness

Phase 38 hardens the existing vertical slices and closes the authenticated recovery path. Final gate results and counts are recorded in [TEST_MATRIX.md](TEST_MATRIX.md) and [EXECUTION_LEDGER.md](EXECUTION_LEDGER.md); this document does not authorize remote deployment.

Implemented corrections include modern PostgREST owner claims, missing Settings/Planner API-schema exposure, UUID Finance identities, usable sign-out controls, reviewed server transactions for restore/deletion, serialized Node transaction queries, editor controls locked during saves, and manifest-owned provider/recovery contributions. Compatible Expo patches remove the four earlier Doctor recommendations.

## Release gate

- Full workspace domain, calculation, validation, service, repository, authentication, registry, web, and mobile tests must pass.
- Type-check, strict lint, generated-source checks, migration/RLS tests, Next production build, and Expo Android/iOS/web exports must pass.
- Production browser workflows must cover owner login, Education, Health, Finance, saved calculations, Today, Planner, Settings, export, reviewed restore, and logout.
- Tracked content and generated client bundles must exclude credentials, private fixture tokens, and server-only integration variables.
- Audit findings must be recorded with reachability and operating conditions. The current audit is nonzero; [SECURITY_REVIEW.md](SECURITY_REVIEW.md) records unresolved upstream advisories.

## Quality and practical limits

Critical forms expose labels, validation feedback, pending controls, and empty/error states. Browser checks exercise narrow navigation, command-palette keyboard opening/dismissal, and horizontal overflow. Mobile components use safe areas, keyboard-aware layouts, and labelled controls; native VoiceOver/TalkBack and touch behavior remain unverified. Curated Portfolio uses semantic headings, a skip link, visible focus, and responsive layout. These checks are not a complete assistive-technology audit.

The domain stores Finance amounts as decimal strings and SQL NUMERIC; recovery preserves values such as `12.3400`. Dates are validated ISO timestamps/date keys, Planner recurrence is UTC/date-based, and UI input converts local timestamps explicitly. Existing timezone/reference tests cover these contracts; local-calendar behavior across daylight-saving changes still needs device smoke tests.

Supabase reads page through owner records in batches of 1,000. Some adapter filters and Today summaries run over the owner result set in memory. Owner indexes and stable pagination are tested, but this is a personal-scale design, not a measured multi-user service. Recovery locks can temporarily delay normal writes. There is no offline record cache, background write queue, or conflict-free offline merge. Large client bundles are reported rather than hidden; further code splitting and device profiling are follow-up work.

## External completion conditions

Production project identity, credentials, domain, redirect allowlist, and migration state must be verified before deployment. Native signing/build identities and devices are also required. Strava application registration and public Portfolio publication are optional owner decisions. Phase 39 prepares reviewable artifacts and procedures; unknown targets, purchases, destructive remote operations, and app-store publication remain outside this mission's authorization.
