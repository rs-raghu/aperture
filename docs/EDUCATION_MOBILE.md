# Education mobile preview

Phase 10 implements an Education-only development preview with Expo Router, React Native, the real `@aperture/education` application service, and the volatile `@aperture/education-memory` adapter. It is not a complete Aperture application or durable storage. Do not enter personal data.

## Architecture and dependency direction

```text
Expo Router route files
  → Education mobile screens/hooks/view models
  → @aperture/education service and use cases
  → Education repository interfaces
  → @aperture/education-memory
  → Education models, validation, and calculations
```

`apps/mobile/src/app/(tabs)/education` contains thin route and layout modules. `apps/mobile/src/features/education` contains the mobile composition adapter, provider, hooks, navigation metadata, screens, native components, styles, testing helper, and presentation error/formatting view models. Mobile imports only public workspace entry points and does not import the Phase 9 web feature.

## Route and screen inventory

| Route | Screen and workflow |
| --- | --- |
| `/education` | Overview, setup CTA, active semester/course counts, deadlines, GPA/CGPA, attendance, study time, recent completed activity, and local navigation |
| `/education/setup` | Create institution, program, and semester; activate planned semester; display hierarchy |
| `/education/courses` | Create, filter, edit, inspect, and confirm archival of courses |
| `/education/assignments` | Create, edit, and filter assignments; perform supported submit/complete transitions |
| `/education/exams` | Schedule, edit, and filter exams; perform the supported completion transition |
| `/education/grades` | Record/delete grades and display service-provided weighted-grade, GPA, and CGPA results |
| `/education/attendance` | Record/delete/filter attendance and display service-provided totals and percentage |
| `/education/study-sessions` | Schedule/filter/start/complete/cancel study sessions and display service-provided duration summary |

The root route redirects to `/education`. A shared Stack layout mounts the provider above all eight Education routes, while cards and standard stack back navigation avoid an overcrowded tab bar.

## Composition and lifetime

`createEducationMobileRuntime` creates a fresh memory-repository aggregate, then passes it with an injected `EducationClock` and ID generator into `createEducationService`. `EducationProvider` invokes that factory through a lazy `useState` initializer exactly once per mount. Rerenders and in-app Education navigation retain the same runtime; different providers never share state. A complete app or web-document reload remounts the provider and resets every record, which is disclosed on every screen.

`DEVELOPMENT_MOBILE_OWNER_ID` is a stable synthetic UUID injected once by the composition root. It is only an owner-scoping placeholder, not authentication. A future authenticated owner can replace the provider input without rewriting screens.

The production preview clock uses `new Date().toISOString()` only inside its injected adapter. IDs use Expo's `expo-crypto.randomUUID`; screens never access browser crypto or generate identifiers. Tests inject deterministic clocks and identifiers.

## Expo, Metro, and shared-package compatibility

- `expo-router/entry` is the application entry point; the Router plugin and typed routes are enabled in `app.json`.
- Expo Router uses `src/app`, so route files remain under the Phase 4 source convention.
- Metro resolves built workspace packages through normal npm workspace links. Prestart, pretest, and preexport scripts compile Validation, Education, and Education Memory first.
- React 19.2.3, React Native 0.86.3, and Safe Area Context 5.7.0 are pinned as root peer-resolution anchors so npm does not hoist versions outside Expo SDK 57's supported set. The web workspace shares React 19.2.3 and is regression-built.
- Expo SDK 57 installs a standards-compatible `structuredClone` runtime. The memory adapter therefore retains its tested defensive-copy implementation without a global polyfill or JSON serialization fallback.
- `expo-crypto` supplies the UUID adapter. There is no Node-only module or browser-global dependency in the mobile feature.

## Forms, lists, and errors

Forms retain their controlled text after failed submission, distinguish required inputs, use appropriate mobile keyboard hints, and delegate parsing/validation to existing Education service schemas. `KeyboardAvoidingView`, safe-area context, and scrollable form surfaces keep inputs reachable. Pending actions disable duplicate submission. Destructive grade, attendance, archive, cancellation, and similar actions use native confirmation alerts.

`normalizeEducationMobileError` converts Validation, Education application, and unexpected errors into safe field/form messages. It preserves field paths, removes stack details, and never displays raw Zod objects or `[object Object]`. Empty attendance collections are displayed as unavailable before the non-empty attendance calculator is called.

Potentially growing course, assignment, exam, grade, attendance, and study-session collections use horizontally scrolling `FlatList` surfaces with stable entity IDs. Long titles wrap within bounded cards. Buttons expose roles, labels, hints, pressed/disabled state, and minimum mobile touch height; badges include text rather than communicating by color alone.

## Tests

The mobile Jest/`jest-expo` suite uses React Native Testing Library. It covers provider stability, isolation and remounting, development-owner injection, Strict Mode, real service/memory workflows, empty and populated overview states, route metadata, required/numeric/date validation, preserved input, pending duplicate prevention, clean empty attendance behavior, readable errors, Expo UUID generation, injected clock values, and public feature imports. Synthetic values only are used.

## Running and verification

```bash
npm install
npm run start --workspace @aperture/mobile
npm run web --workspace @aperture/mobile
npm run test --workspace @aperture/mobile
npm run lint --workspace @aperture/mobile
npm run typecheck --workspace @aperture/mobile
npm run export --workspace @aperture/mobile -- --platform android
npm run export --workspace @aperture/mobile -- --platform ios
npm run export --workspace @aperture/mobile -- --platform web
```

Phase 10 verification used `expo install --check`, `expo-doctor`, Metro web startup, Android/iOS/web JavaScript exports, and manual Expo web inspection at the normal desktop viewport and an explicit 390×844 phone viewport. All eight routes, setup-to-summary workflows, long content, empty states, lifecycle actions, provider navigation lifetime, and runtime logs were inspected. No Android SDK/emulator was available on the Windows host, so Android was exported but not run. iOS was exported only; no iOS runtime claim is made.

## Dependencies added in Phase 10

- Runtime: workspace Education packages, `@expo/metro-runtime`, `expo-crypto`, `react-dom`, `react-native-web`, and `react-native-safe-area-context`.
- Development: `@testing-library/react-native`, `jest-expo`, Expo ESLint configuration, ESLint, and Jest types.
- Root React/React DOM/React Native/Safe Area Context entries are peer-resolution anchors for the Expo SDK-compatible versions, not new application layers.

No form library, state library, component framework, charting package, date picker, persistence package, database package, authentication package, or deployment package was added.

## Audit result

The Phase 4/9 accepted baseline was 21 Expo/React Native transitive advisories (13 moderate and 8 high). Phase 10 dependency resolution reports 13 moderate and 0 high advisories, a reduction of eight high findings and no new advisory. The web production dependency audit remains a separate required regression check. No forced audit rewrite is used.

## Known limitations and deferred work

- Memory data resets on a complete reload and must not be treated as durable or secure.
- The synthetic owner is not authentication or authorization.
- Date/time entry is validated ISO text rather than a native picker.
- A completed study session without stored `actualDurationMinutes` is explicitly omitted from duration totals, matching Phase 9/service behavior.
- Android and iOS exports are JavaScript bundle checks, not native binaries or device testing.

There is no AsyncStorage data persistence, SQLite, Supabase, PostgreSQL, API, authentication, biometric flow, offline synchronization, notification, calendar integration, Health/Finance feature, complete dashboard shell, deployment, store packaging, publishing, or Phase 11 implementation.
