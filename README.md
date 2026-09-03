# Aperture v2

Aperture v2 is being built incrementally as a new, independent project.

Phase 5 implements runtime Education models and validation, Phase 6 implements seven academic calculators, Phase 7 implements dependency-injected Education services, Phase 8 provides an isolated Education in-memory repository adapter, and Phase 9 adds an Education-only Next.js development preview. Health and Finance remain declaration-only. The Expo mobile workspace remains a structural skeleton.

Education objects can be parsed with strict Zod schemas; the calculators and owner-scoped workflows run behind a responsive web feature using the volatile `@aperture/education-memory` adapter. Preview data disappears on browser refresh and is not the future Supabase repository. The Education preview is runnable locally, but Aperture is not a complete or production-ready application. There is no authentication, database client, synchronization, API, durable storage, Health UI, Finance UI, or mobile feature.

Do not enter personal or financial data. The existing Aperture project is retained separately and is not imported into this project.

Phase 9 implements the Education web preview only. Phase 10 has not started.

## Structural verification

```bash
npm install
npm run typecheck
npm test
npm run build --workspace @aperture/validation
npm run build --workspace @aperture/education
npm run build --workspace @aperture/education-memory
npm run lint --workspace @aperture/web
npm run build --workspace @aperture/web
```

See [the phase plan](docs/PHASES.md), [the Education inventory](docs/EDUCATION_SKELETON.md), [the Health inventory](docs/HEALTH_SKELETON.md), [the Finance inventory](docs/FINANCE_SKELETON.md), and [architectural decisions](docs/DECISIONS.md).

Phase 5 schema and validation rules are documented in [Education models and validation](docs/EDUCATION_MODELS_AND_VALIDATION.md). Phase 6 formulas are documented in [Education calculations](docs/EDUCATION_CALCULATIONS.md). Phase 7 workflows are documented in [Education services](docs/EDUCATION_SERVICES.md). Phase 8 storage behavior is documented in [Education memory repository](docs/EDUCATION_MEMORY_REPOSITORY.md). Phase 9 routes and composition are documented in [Education web](docs/EDUCATION_WEB.md).

Phase 4 inventories are documented in [the platform skeleton](docs/PLATFORM_SKELETON.md), [planned routes](docs/ROUTE_INVENTORY.md), [environment variables](docs/ENVIRONMENT_VARIABLES.md), [dependencies](docs/DEPENDENCIES.md), and [deployment plan](docs/DEPLOYMENT_PLAN.md).
