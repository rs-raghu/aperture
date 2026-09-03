# Phase 9 Education web preview

Phase 9 makes the Education feature runnable in a browser as a local development preview. It is not the complete Aperture shell, a production application, or durable storage.

## Architecture and dependency direction

The feature lives under `apps/web/src/features/education`; App Router files beneath `apps/web/src/app/(dashboard)/education` only compose feature screens. The dependency path is:

```text
Education route and feature UI
  -> @aperture/education services, models, validation and calculations
  -> Education repository interfaces
  -> @aperture/education-memory adapter
```

The domain and application packages do not import React, Next.js, browser APIs, or the memory adapter. The memory adapter does not import UI code.

## Routes

| URL | Purpose |
| --- | --- |
| `/education` | Service-composed overview and empty-state onboarding |
| `/education/setup` | Institution, program, semester creation and semester activation |
| `/education/courses` | Course creation, filtering, editing, and archival |
| `/education/assignments` | Assignment creation, filtering, overdue display, submission, and completion |
| `/education/exams` | Exam scheduling, filtering, and completion |
| `/education/grades` | Grade recording/deletion and service-calculated weighted grade, GPA, and CGPA |
| `/education/attendance` | Attendance recording/deletion and service-calculated attendance summary |
| `/education/study-sessions` | Study scheduling, filtering, start, completion, cancellation, and summary |

Education exports its own navigation metadata from the feature. The routes share a small Education-local shell and do not depend on the future global dashboard layout.

## Composition root and lifetime

`createEducationWebRuntime` constructs a new aggregate memory repository, the real Education service, a web clock, an ID generator, and an operation context. `EducationProvider` initializes that runtime as mount-local React state. It stays stable across provider rerenders and navigation beneath the shared Education layout. Separate provider mounts receive separate repositories. There is no module singleton or mutable global store.

The preview injects the fixed synthetic owner UUID `90000000-0000-4000-8000-000000000009`. It is explicitly a development owner identity, not authentication. A future authenticated owner can replace it at the composition boundary without changing screens.

Repository data exists only for the mounted provider. A full browser refresh resets it. Every Education page displays this limitation. No local storage, IndexedDB, filesystem, network, SQL, or Supabase persistence is used.

## Forms and errors

Forms are controlled React forms that preserve submitted values on failure. Browser values are converted to domain boundary values immediately before a service call: numbers become integral numbers where the schema requires them, timestamps become explicit-zone ISO strings, and decimal values remain strings. Service calls are grouped in feature hooks and guarded against duplicate pending submissions.

The shared UI normalizer recognizes Education application errors, memory-adapter errors, and issue-shaped validation failures. It retains issue paths for field messages, supplies a safe form-level fallback, and never renders raw error objects, stack traces, or `[object Object]`.

The UI does not calculate GPA, CGPA, weighted grades, or attendance. It displays calculation results returned by Education summary methods. Missing values remain visibly absent rather than becoming fake zeroes.

## Styling and accessibility

The preview uses semantic HTML and a small global stylesheet: navy and teal surfaces, high-contrast amber focus rings, responsive form/list grids, horizontal table overflow, explicit labels, described validation fields, status text in addition to color, pending button feedback, and semantic loading/error/empty states. Navigation and all actions are keyboard reachable. The layout collapses to one column below 780 pixels.

## Testing

Vitest with Testing Library and jsdom verifies provider stability and isolation, injected owner identity, error normalization, required-field behavior, input preservation, duplicate-submit prevention, and a real-service workflow from setup through course, assignment, exam, grade, attendance, study session, and overview. The principal workflow uses `@aperture/education-memory`; it does not replace the service with a mock.

Run the preview and checks with:

```bash
npm run dev --workspace @aperture/web
npm test --workspace @aperture/web
npm run lint --workspace @aperture/web
npm run typecheck
npm run build --workspace @aperture/web
```

Open `http://localhost:3000/education` after the development server starts.

## Phase 9 dependencies

- `@testing-library/react` and `@testing-library/user-event` support accessible component interaction tests.
- `jsdom` supplies the DOM environment used by the root-hoisted Vitest runner. It is declared in the web workspace and root test-tooling scope because the hoisted runner resolves environments from the root.
- `eslint` and `eslint-config-next` provide Next.js and React static checks.
- `@types/react` and `@types/react-dom` provide TypeScript declarations.
- `@aperture/education` and `@aperture/education-memory` are local runtime workspace dependencies.

No form, state, component, charting, persistence, database, authentication, analytics, or deployment library was added.

## Deferred work and limitations

The web preview does not persist refreshes, authenticate users, provide production authorization, render Health or Finance, expose an API, integrate Supabase, import/export data, notify users, integrate calendars, or deploy. Study completion uses the existing service lifecycle; because that contract does not infer an actual duration, summaries explicitly report completed sessions whose stored duration is missing. Phase 10 adds a separate React Native/Expo Education presentation boundary without changing this web feature.

The accepted dependency-audit exception remains the pre-existing Expo/React Native transitive baseline of 21 advisories (13 moderate and 8 high). Phase 9 adds no affected production web dependency and must not increase that count.
