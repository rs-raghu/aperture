# Phase 4 dependencies

Versions below are the direct versions resolved on 2026-09-03. The root TypeScript 5.9.3 and `@types/node` 24.13.3 development baseline is unchanged.

## Web workspace

| Package | Resolved version | Kind | Purpose and why needed now |
| --- | ---: | --- | --- |
| `next` | 16.3.4 | Runtime | Establishes the planned App Router platform and supplies framework types/configuration contracts. |
| `react` | 19.2.8 | Runtime | Next.js peer runtime required for a compatible web platform manifest. No component is created. |
| `react-dom` | 19.2.8 | Runtime | Next.js browser-rendering peer required for manifest compatibility. No rendering is implemented. |
| `@supabase/supabase-js` | 2.114.0 | Runtime | Reserves the future typed Supabase client dependency; no client is instantiated. |
| `@supabase/ssr` | 0.12.5 | Runtime | Reserves future server/browser session integration boundaries for Next.js; no auth behavior exists. |

## Mobile workspace

| Package | Resolved version | Kind | Purpose and why needed now |
| --- | ---: | --- | --- |
| `expo` | 57.0.19 | Runtime | Defines the official mobile SDK compatibility baseline and provides its TypeScript base configuration. |
| `expo-router` | 57.0.18 | Runtime | Registers the future file-based navigation platform; no executable route exists. |
| `react` | 19.2.3 | Runtime | Expo SDK-compatible React peer. No component is created. |
| `react-native` | 0.86.3 | Runtime | Expo SDK-compatible native platform peer. No native UI is created. |
| `@supabase/supabase-js` | 2.114.0 | Runtime | Reserves the future typed Supabase client dependency; no client is instantiated. |
| `react-native-url-polyfill` | 4.0.0 | Runtime | Reserves URL API compatibility required by the future mobile Supabase adapter. It is not imported. |
| `@react-native-async-storage/async-storage` | 2.2.0 | Runtime | Reserves Expo-supported persistent session storage for future authentication design. No value is stored. |

## Compatibility verification

`npx expo install` selected the mobile React, React Native, Expo Router, and Async Storage versions. `npx expo install --check` reported that dependencies are up to date. The root TypeScript check passes. No production build or application launch was attempted.

`npm audit` reports 21 transitive vulnerabilities: 13 moderate and 8 high. The reported paths are within the Expo Router/Expo/React Native toolchain (`decode-uri-component`, `image-size`, and `uuid`). Suggested forced remediations would replace the SDK-compatible direct packages with breaking, older versions, so Phase 4 does not apply an automatic or forced rewrite. No application code executes these packages in this non-runnable skeleton.

## Phase 5 additions

| Package | Workspace | Resolved version | Kind | Purpose |
| --- | --- | ---: | --- | --- |
| `zod` | `@aperture/validation` | 3.25.76 | Runtime | Implements the narrow shared structural-schema and validation boundary used by Education. |
| `vitest` | root development tooling | 4.1.11 | Development | Runs focused tests for both shared Validation and Education schemas. |

`@aperture/education` depends on the local `@aperture/validation` workspace at its exact `0.5.0` version. npm 11.5.2 in this environment rejects the `workspace:*` protocol, so the matching workspace version is used; npm still links the local workspace package.

## Phase 6 addition

| Package | Workspace | Resolved version | Kind | Purpose |
| --- | --- | ---: | --- | --- |
| `decimal.js` | `@aperture/education` | 10.6.0 | Runtime | Performs all academic decimal arithmetic and explicit final rounding without binary floating-point drift. |

## Phase 9 additions

| Package | Workspace | Kind | Purpose |
| --- | --- | --- | --- |
| `@aperture/education` | `@aperture/web` | Runtime workspace link | Supplies implemented models, workflows, summaries, validation, and calculators to the Education feature. |
| `@aperture/education-memory` | `@aperture/web` | Runtime workspace link | Supplies isolated, volatile storage for the development preview. |
| `@types/react`, `@types/react-dom` | `@aperture/web` | Development | Type-check JSX and React DOM usage. |
| `@testing-library/react`, `@testing-library/user-event` | `@aperture/web` | Development | Exercise accessible forms and real-service component workflows. |
| `jsdom` | web and root test tooling | Development | Supplies a browser-like DOM; the root declaration is required because Vitest is hoisted at the workspace root. |
| `eslint`, `eslint-config-next` | `@aperture/web` | Development | Run compatible Next.js, TypeScript, accessibility-adjacent, and React hook static checks. |

No new form, state, chart, UI framework, persistence, database, authentication, API, analytics, or deployment dependency is installed. Final compatibility is verified through web tests, lint, TypeScript, and a Next.js production build. The accepted pre-existing Expo/React Native audit baseline remains 21 advisories (13 moderate and 8 high); Phase 9 introduces no additional finding.

## Phase 10 additions and compatibility corrections

| Package | Workspace | Resolved version | Kind | Purpose |
| --- | --- | ---: | --- | --- |
| `@aperture/education` | `@aperture/mobile` | 0.7.0 | Runtime workspace link | Supplies real models, validation-backed workflows, summaries, and calculations. |
| `@aperture/education-memory` | `@aperture/mobile` | 0.8.0 | Runtime workspace link | Supplies isolated volatile storage per Education provider. |
| `@expo/metro-runtime` | `@aperture/mobile` | 57.0.15 | Runtime | Supplies the Expo web/Metro runtime required by the Router preview. |
| `expo-crypto` | `@aperture/mobile` | 57.0.2 | Runtime | Supplies an Expo-compatible UUID function behind the injected ID-generator contract. |
| `react-dom` | `@aperture/mobile` | 19.2.3 | Runtime | Supports the permitted Expo web preview. |
| `react-native-web` | `@aperture/mobile` | 0.21.2 | Runtime | Renders React Native primitives in the Expo web inspection runtime. |
| `react-native-safe-area-context` | `@aperture/mobile` | 5.7.x | Runtime | Supplies safe-area primitives at Expo SDK 57's expected version. |
| `@testing-library/react-native` | `@aperture/mobile` | 14.0.1 | Development | Exercises accessible native screens with real services and memory storage. |
| `jest-expo` | `@aperture/mobile` | 57.0.5 | Development | Supplies the Expo SDK-compatible Jest preset and React Native transforms. |
| `@types/jest` | `@aperture/mobile` | 29.5.14 | Development | Types the mobile Jest suite at Expo SDK 57's expected version. |
| `eslint`, `eslint-config-expo` | `@aperture/mobile` | 9.39.5, 57.0.2 | Development | Statically checks Expo, React Native, hooks, and TypeScript source. |

Root `react` 19.2.3, `react-dom` 19.2.3, `react-native` 0.86.3, and `react-native-safe-area-context` 5.7.0 entries pin npm's hoisted peer graph to the Expo SDK 57-compatible set. The web React/React DOM declarations were aligned from 19.2.8 to 19.2.3; the Phase 9 Next production build remains the compatibility regression check. These root entries are peer-resolution anchors and do not add runtime application behavior.

`npx expo install --check` reports dependencies up to date, and `expo-doctor` validates the monorepo dependency graph. Phase 10 adds no form, global-state, UI-framework, charting, date-picker, persistence, database, auth, analytics, notification, or deployment library. The full audit now reports 13 moderate and 0 high advisories versus the accepted 21-advisory baseline (13 moderate, 8 high), so Phase 10 adds no advisory and removes eight high transitive findings.
