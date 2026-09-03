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
