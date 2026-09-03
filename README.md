# Aperture v2

Aperture v2 is being built incrementally as a new, independent project.

Phase 5 implements runtime Education models and validation, Phase 6 implements seven academic calculators, Phase 7 implements dependency-injected Education services, and Phase 8 provides an isolated Education in-memory repository adapter. Health and Finance remain declaration-only. Phase 4's Next.js web and Expo mobile workspaces remain structural skeletons.

Education objects can be parsed with strict Zod schemas; the calculators and owner-scoped workflows can run against the volatile `@aperture/education-memory` adapter. Its data disappears with each repository instance or process and it is not the future Supabase repository. There are no pages, screens, route handlers, components, authentication, database clients, synchronization, or API requests. Aperture v2 is not a runnable application.

Do not enter personal or financial data. The existing Aperture project is retained separately and is not imported into this project.

Phase 8 implements Education memory repositories and their tests only. Phase 9 has not started.

## Structural verification

```bash
npm install
npm run typecheck
npm test
npm run build --workspace @aperture/validation
npm run build --workspace @aperture/education
npm run build --workspace @aperture/education-memory
```

See [the phase plan](docs/PHASES.md), [the Education inventory](docs/EDUCATION_SKELETON.md), [the Health inventory](docs/HEALTH_SKELETON.md), [the Finance inventory](docs/FINANCE_SKELETON.md), and [architectural decisions](docs/DECISIONS.md).

Phase 5 schema and validation rules are documented in [Education models and validation](docs/EDUCATION_MODELS_AND_VALIDATION.md). Phase 6 formulas are documented in [Education calculations](docs/EDUCATION_CALCULATIONS.md). Phase 7 workflows are documented in [Education services](docs/EDUCATION_SERVICES.md). Phase 8 storage behavior is documented in [Education memory repository](docs/EDUCATION_MEMORY_REPOSITORY.md).

Phase 4 inventories are documented in [the platform skeleton](docs/PLATFORM_SKELETON.md), [planned routes](docs/ROUTE_INVENTORY.md), [environment variables](docs/ENVIRONMENT_VARIABLES.md), [dependencies](docs/DEPENDENCIES.md), and [deployment plan](docs/DEPLOYMENT_PLAN.md).
