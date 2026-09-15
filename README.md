# Aperture v2

Aperture v2 is being built incrementally as a new, independent project.

Phase 5 implements runtime Education models and validation, Phase 6 implements seven academic calculators, Phase 7 implements dependency-injected Education services, Phase 8 provides an isolated Education in-memory repository adapter, Phase 9 adds an Education-only Next.js preview, and Phase 10 adds an Education-only Expo/React Native preview. Phase 11 adds Health runtime models and structural validation, Phase 12 implements all 11 declared Health calculations, and Phase 13 implements the owner-scoped Health application service and lifecycle workflows. Finance remains declaration-only.

Education objects can be parsed with strict Zod schemas; calculators and owner-scoped workflows power responsive web and mobile previews through the volatile `@aperture/education-memory` adapter. Preview data disappears on browser/app reload and is not the future Supabase repository. Aperture is not a complete or production-ready application. There is no authentication, database client, synchronization, API, durable storage, Health UI, or Finance UI.

Do not enter personal or financial data. The existing Aperture project is retained separately and is not imported into this project.

Phase 13 adds 136 unique Health service methods over injected repository, clock, and identifier contracts. Service inputs and outputs are validated, relationships are owner-checked before writes, lifecycle transitions are explicit, and summaries use the Phase 12 calculators. Health repository implementations and UI remain deferred to later phases.

## Structural verification

```bash
npm install
npm run typecheck
npm test
npm run build --workspace @aperture/validation
npm run build --workspace @aperture/health
npm run build --workspace @aperture/education
npm run build --workspace @aperture/education-memory
npm run lint --workspace @aperture/web
npm run build --workspace @aperture/web
npm run test --workspace @aperture/mobile
npm run lint --workspace @aperture/mobile
npm run typecheck --workspace @aperture/mobile
npm run export --workspace @aperture/mobile -- --platform web
```

See [the phase plan](docs/PHASES.md), [the Education inventory](docs/EDUCATION_SKELETON.md), [the Health inventory](docs/HEALTH_SKELETON.md), [the Finance inventory](docs/FINANCE_SKELETON.md), and [architectural decisions](docs/DECISIONS.md).

Phase 11 schemas, structural boundaries, declaration classification, and checks are documented in [Health models and validation](docs/HEALTH_MODELS_VALIDATION.md).

Phase 12 formulas are documented in [Health calculations](docs/HEALTH_CALCULATIONS.md). Phase 13 workflows, ownership rules, transitions, summaries, and errors are documented in [Health services](docs/HEALTH_SERVICES.md).

Phase 5 schema and validation rules are documented in [Education models and validation](docs/EDUCATION_MODELS_AND_VALIDATION.md). Phase 6 formulas are documented in [Education calculations](docs/EDUCATION_CALCULATIONS.md). Phase 7 workflows are documented in [Education services](docs/EDUCATION_SERVICES.md). Phase 8 storage behavior is documented in [Education memory repository](docs/EDUCATION_MEMORY_REPOSITORY.md). Phase 9 web routes and composition are documented in [Education web](docs/EDUCATION_WEB.md). Phase 10 mobile routes, composition, and verification are documented in [Education mobile](docs/EDUCATION_MOBILE.md).

Phase 4 inventories are documented in [the platform skeleton](docs/PLATFORM_SKELETON.md), [planned routes](docs/ROUTE_INVENTORY.md), [environment variables](docs/ENVIRONMENT_VARIABLES.md), [dependencies](docs/DEPENDENCIES.md), and [deployment plan](docs/DEPLOYMENT_PLAN.md).
