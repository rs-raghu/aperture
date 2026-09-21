# Health mobile preview

> **Phase 31 update:** authenticated routes now receive the shared Supabase
> repository and owner from the tabs composition root. Memory storage and
> synthetic owners remain only in tests and the explicit development bypass.

Phase 16 composes the runtime Health service and `@aperture/health-memory` adapter into a local Expo/React Native preview. It is a presentation and composition layer; domain validation, ownership, lifecycle transitions, relationships, calculations, and summaries remain in the shared Health package.

## Routes

| Route | Capability |
| --- | --- |
| `/health` | Profile prompt, overview counts, latest measurements, and upcoming appointments |
| `/health/profile` | Create or edit the single owner profile |
| `/health/measurements` | Record, filter, and delete body measurements |
| `/health/vitals` | Record, filter, and delete supported vital readings |
| `/health/workouts` | Manage exercises and plans, workout lifecycle states, and exercise sets |
| `/health/running` | Manage routes, equipment, activities, results, lifecycle completion, and usage |
| `/health/sleep` | Record and delete sleep observations |
| `/health/nutrition` | Record, filter, and delete nutrition entries |
| `/health/hydration` | Record, date-filter, total, and delete hydration entries |
| `/health/goals` | Track achieved personal records and recovery observations using implemented contracts |

The route files only select feature screens. The Health Stack layout mounts the provider above every route, and the navigation cards expose the nine detail workflows without expanding the main tab bar.

## Runtime composition and lifetime

`createHealthMobileRuntime` creates a fresh Health memory-repository aggregate and passes it with an injected clock and ID generator to `createHealthService`. `HealthProvider` invokes that factory once through a lazy state initializer. Rerenders and in-app Health navigation retain the runtime; separate provider instances do not share state. A full reload or provider remount resets all preview records.

The production adapter uses `expo-crypto.randomUUID` and keeps wall-clock access inside the injected clock. Screens use no browser globals or Node-only modules. `health-mobile-preview-owner` is a visible synthetic identity used to exercise owner-scoped workflows; it is not authentication or authorization.

## Native interaction and accessibility

Safe-area views bound each screen. Forms use keyboard-aware scroll containers, controlled text fields, mobile keyboard hints, associated accessibility labels, readable pending states, and buttons with minimum touch height. Submission errors retain the user's input and are normalized into concise messages without raw validation objects or stack traces.

Potentially growing record collections use `FlatList` with stable record IDs. Cards allow long titles and notes to wrap across several lines. Status chips include the literal `Status:` label, so state is not conveyed by color alone. Empty collections have explicit text and primary next actions.

## Behavior and safety boundary

All mutations, relationship checks, lifecycle transitions, ownership rules, unit conversions, arithmetic, and summaries call the public Health service. Mobile form code adapts strings into existing service inputs and does not copy formulas from the domain package or web feature.

The preview records observations and displays factual values, lifecycle states, counts, units, and service-calculated totals. It does not diagnose, classify clinical values, set intake targets, prescribe workouts, or provide nutrition, recovery, training, or medical recommendations. The Goals route records achieved personal records and recovery observations because the Health contract does not define persisted future targets.

## Tests and verification

The Jest Expo suite uses React Native Testing Library with the real Health service and memory repository. It covers provider stability and remount isolation, development-owner injection, public imports, error normalization, invalid and preserved form input, measurement and hydration workflows, sleep ordering validation, navigation metadata, an end-to-end cross-domain workflow, and overview persistence.

Phase 16 verification includes mobile lint and type-check, all mobile tests, Expo Doctor, and Android, iOS, and web JavaScript exports. Export success validates Expo/Metro bundling for those targets; it is not a native binary or device test. Native Android is attempted only when a connected runtime is available, and iOS native execution is unavailable on this Windows host.

## Running locally

```bash
npm run start --workspace @aperture/mobile
npm run web --workspace @aperture/mobile
npm run test --workspace @aperture/mobile
npm run lint --workspace @aperture/mobile
npm run typecheck --workspace @aperture/mobile
npm run export --workspace @aperture/mobile -- --platform android
npm run export --workspace @aperture/mobile -- --platform ios
npm run export --workspace @aperture/mobile -- --platform web
```

## Known limitations

- Health records are volatile and reset on reload.
- The synthetic owner is not a user session or security boundary.
- ISO date/time values use text entry rather than a native date picker.
- Android and iOS export checks do not prove native execution.
- There is no device persistence, database, API, authentication, synchronization, import/export, notification, external health integration, deployment, or store packaging.
