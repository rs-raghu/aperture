# Aperture v2

Aperture v2 is being built incrementally as a new, independent project.

Phase 5 implements runtime Education models and validation, Phase 6 implements seven academic calculators, Phase 7 implements dependency-injected Education services, Phase 8 provides an isolated Education in-memory repository adapter, Phase 9 adds an Education-only Next.js preview, and Phase 10 adds an Education-only Expo/React Native preview. Phase 11 adds Health runtime models and structural validation, Phase 12 implements all 11 declared Health calculations, Phase 13 implements the owner-scoped Health application service and lifecycle workflows, Phase 14 provides an isolated Health memory repository adapter, Phase 15 adds the Health Next.js preview, Phase 16 adds the matching Expo/React Native preview, and Phase 17 hardens the complete Health vertical slice. Finance remains declaration-only.

Education and Health objects can be parsed with strict Zod schemas; calculators and owner-scoped workflows power responsive web and mobile previews through volatile memory adapters. Preview data disappears on browser/app reload and is not the future Supabase repository. Aperture is not a complete or production-ready application. There is no authentication, synchronization, API, durable storage, or Finance UI.

Do not enter personal or financial data. The existing Aperture project is retained separately and is not imported into this project.

Phase 14 implements every Health repository interface in `@aperture/health-memory`. Each factory is isolated and empty, all operations are owner-scoped, values are defensively copied, queries have deterministic ordering and validated cursors, and equipment usage supports unit-safe aggregation. Phase 15 composes that adapter and the real Health service into ten responsive Health web routes. Phase 16 provides the same feature through ten mobile-native Expo Router routes with safe-area, keyboard, virtualized-list, accessibility, and medical-safety boundaries.

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

See [the phase plan](docs/PHASES.md), [the Education inventory](docs/EDUCATION_SKELETON.md), [the Health inventory](docs/HEALTH_SKELETON.md), [the Finance inventory](docs/FINANCE_SKELETON.md), and [architectural decisions](docs/DECISIONS.md).

Phase 11 schemas, structural boundaries, declaration classification, and checks are documented in [Health models and validation](docs/HEALTH_MODELS_VALIDATION.md).

Phase 12 formulas are documented in [Health calculations](docs/HEALTH_CALCULATIONS.md). Phase 13 workflows, ownership rules, transitions, summaries, and errors are documented in [Health services](docs/HEALTH_SERVICES.md).

Phase 14 memory behavior and reusable repository contracts are documented in [Health memory repository](docs/HEALTH_MEMORY_REPOSITORY.md). Phase 15 routes, composition, workflows, and safety boundaries are documented in [Health web](docs/HEALTH_WEB.md). Phase 16 mobile routes, composition, native interaction behavior, and compatibility checks are documented in [Health mobile](docs/HEALTH_MOBILE.md). Phase 17 architecture, parity, time, accessibility, safety, verification, and durable-storage boundaries are documented in [Health vertical slice](docs/HEALTH_VERTICAL_SLICE.md).

Phase 5 schema and validation rules are documented in [Education models and validation](docs/EDUCATION_MODELS_AND_VALIDATION.md). Phase 6 formulas are documented in [Education calculations](docs/EDUCATION_CALCULATIONS.md). Phase 7 workflows are documented in [Education services](docs/EDUCATION_SERVICES.md). Phase 8 storage behavior is documented in [Education memory repository](docs/EDUCATION_MEMORY_REPOSITORY.md). Phase 9 web routes and composition are documented in [Education web](docs/EDUCATION_WEB.md). Phase 10 mobile routes, composition, and verification are documented in [Education mobile](docs/EDUCATION_MOBILE.md).

Phase 4 inventories are documented in [the platform skeleton](docs/PLATFORM_SKELETON.md), [planned routes](docs/ROUTE_INVENTORY.md), [environment variables](docs/ENVIRONMENT_VARIABLES.md), [dependencies](docs/DEPENDENCIES.md), and [deployment plan](docs/DEPLOYMENT_PLAN.md).
