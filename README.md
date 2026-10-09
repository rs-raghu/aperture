# Aperture v2

Aperture v2 is an owner-only personal dashboard with Next.js web and Expo mobile applications. Education, Health, Finance, 38 shared calculators, Today, Planner, Settings, and reviewed data recovery share strict domain contracts and durable owner-scoped Supabase repositories. Optional Strava imports remain isolated; Portfolio contains explicitly curated content and defaults to private.

Production authentication verifies the configured owner's Supabase identity. Database migrations enforce owner RLS and keep integration credentials server-only. Cloud mode shares data across platforms with explicit network errors and no offline record cache or write outbox. The opt-in development bypass uses temporary synthetic memory data and is rejected in production.

Phase 38 hardens the release and verifies authenticated browser workflows. Phase 39 supplies production templates, Vercel/EAS configuration, ordered migration staging, health checks, safe operational hooks, and [deployment procedures](docs/DEPLOYMENT_PLAN.md). Local checks do not establish a remote deployment or native-device result. Dependency advisories remain disclosed in [the security review](docs/SECURITY_REVIEW.md); inspect [release readiness](docs/RELEASE_READINESS.md) and [the execution ledger](docs/EXECUTION_LEDGER.md) before selecting a deployment target. The earlier Aperture project remains separate.

## Structural verification

```bash
npm install
npm run typecheck
npm test
npm run build --workspace @aperture/validation
npm run build --workspace @aperture/health
npm run build --workspace @aperture/health-memory
npm run build --workspace @aperture/education
npm run build --workspace @aperture/education-memory
npm run lint --workspace @aperture/web
npm run build --workspace @aperture/web
npm run test --workspace @aperture/mobile
npm run lint --workspace @aperture/mobile
npm run typecheck --workspace @aperture/mobile
npm run export --workspace @aperture/mobile -- --platform web
```

After building the web app, run the synthetic authenticated browser fixture with `npm run test:e2e --workspace @aperture/e2e`. It uses installed Chrome, an isolated in-memory PostgreSQL database, and a local Auth/REST fixture. It never connects to a remote project. See [the test matrix](docs/TEST_MATRIX.md) for coverage and its limits.

See [the phase plan](docs/PHASES.md), [the Education inventory](docs/EDUCATION_SKELETON.md), [the Health inventory](docs/HEALTH_SKELETON.md), [the Finance inventory](docs/FINANCE_SKELETON.md), and [architectural decisions](docs/DECISIONS.md).

Phase 11 schemas, structural boundaries, declaration classification, and checks are documented in [Health models and validation](docs/HEALTH_MODELS_VALIDATION.md).

Phase 12 formulas are documented in [Health calculations](docs/HEALTH_CALCULATIONS.md). Phase 13 workflows, ownership rules, transitions, summaries, and errors are documented in [Health services](docs/HEALTH_SERVICES.md).

Phase 14 memory behavior and reusable repository contracts are documented in [Health memory repository](docs/HEALTH_MEMORY_REPOSITORY.md). Phase 15 routes, composition, workflows, and safety boundaries are documented in [Health web](docs/HEALTH_WEB.md). Phase 16 mobile routes, composition, native interaction behavior, and compatibility checks are documented in [Health mobile](docs/HEALTH_MOBILE.md). Phase 17 architecture, parity, time, accessibility, safety, verification, and durable-storage boundaries are documented in [Health vertical slice](docs/HEALTH_VERTICAL_SLICE.md).

Phase 5 schema and validation rules are documented in [Education models and validation](docs/EDUCATION_MODELS_AND_VALIDATION.md). Phase 6 formulas are documented in [Education calculations](docs/EDUCATION_CALCULATIONS.md). Phase 7 workflows are documented in [Education services](docs/EDUCATION_SERVICES.md). Phase 8 storage behavior is documented in [Education memory repository](docs/EDUCATION_MEMORY_REPOSITORY.md). Phase 9 web routes and composition are documented in [Education web](docs/EDUCATION_WEB.md). Phase 10 mobile routes, composition, and verification are documented in [Education mobile](docs/EDUCATION_MOBILE.md).

Phase 4 inventories are documented in [the platform skeleton](docs/PLATFORM_SKELETON.md), [planned routes](docs/ROUTE_INVENTORY.md), [environment variables](docs/ENVIRONMENT_VARIABLES.md), [dependencies](docs/DEPENDENCIES.md), and [deployment plan](docs/DEPLOYMENT_PLAN.md).

Phase 36's optional integration, server secrets, web/mobile controls, queue behavior, and live verification steps are documented in [Strava integration](docs/STRAVA_INTEGRATION.md).

Phase 37's curated content, private drafts, publication gates, owner-scoped storage, and recovery are documented in [Portfolio](docs/PORTFOLIO.md).

Phase 39's operator procedures include [disaster recovery](docs/DISASTER_RECOVERY.md) and [deployment smoke tests](docs/POST_DEPLOYMENT_SMOKE_TESTS.md). Generate and verify all core/feature migration artifacts with `npm run deployment:prepare` and `npm run deployment:check`. Production environment checks report missing variable names with `npm run deployment:env` or `npm run deployment:env -- --mobile`; they never prove target ownership or log values.
