# Health vertical slice

> **Phase 31 update:** the signed-in web and mobile slices now use durable,
> shared Supabase repositories. Memory storage remains only for tests and the
> explicit development bypass.

Phase 17 audits and hardens the complete local Health implementation delivered in Phases 11–16. The slice is suitable for synthetic development workflows across the shared package, volatile memory adapter, Next.js preview, and Expo/React Native preview. It is not a production health system and must not be used for personal health data.

## Architecture

```text
Next.js routes and React screens       Expo Router routes and React Native screens
                 \                                  /
                  \-- presentation adapters/hooks --/
                                  |
                    @aperture/health application service
                                  |
                 models, validation, lifecycle rules, calculations
                                  |
                    storage-neutral repository interfaces
                                  |
                       @aperture/health-memory
```

Dependency direction remains one-way. Health domain and application code imports no web, mobile, React, Next.js, Expo, Supabase, database, or device-storage code. The memory adapter depends only on the public Health package. Each application chooses the adapter and injects the clock, identifier generator, and synthetic development owner at its composition root.

## Implemented inventory

- Strict runtime schemas cover the 22 principal stored entities plus identifiers, units, quantities, statuses, create/record inputs, updates, queries, summaries, and calculation boundaries. The generated fixture inventory exercises 134 public model and input/query cases.
- All 11 declared calculations are implemented with validated inputs and results, decimal-string quantities, explicit units, deterministic conversions, and documented estimate flags.
- `createHealthService` exposes the exact tested inventory of 137 distinct lifecycle, query, transition, and summary methods. It validates inputs and repository results, injects time and IDs, checks parent ownership, and follows paginated aggregate reads.
- `@aperture/health-memory` implements all 22 repository properties with isolated factories, owner scoping, defensive copies, deterministic ordering, validated cursors, complete filters, and unit-safe equipment usage.
- Web and mobile each expose the same ten Health destinations: overview, profile, measurements, vitals, workouts, running, sleep, nutrition, hydration, and progress.

The previews expose the same record and lifecycle families through platform-appropriate controls. They both use the real service and memory adapter, retain one runtime across navigation, reset on full reload, normalize errors, and disclose the synthetic owner. Hydration, sleep, recovery, running, workout, and overview values come from service summaries or stored entities. Presentation code contains no copied domain formula.

## Units and precision

Decimal quantities remain strings from input through storage and calculation. Conversion and aggregation use `decimal.js`; the calculation layer rounds decimal outputs once to at most 12 places using half-up. The hardening audit confirmed mixed-unit calculation coverage, explicit output units, input immutability, and no floating-point summation in either Health preview.

Workout duration now derives an exact decimal-second difference from the stored instants through all nine accepted fractional-second digits. The web hydration total now calls `getHydrationSummary`, matching mobile and preserving the shared calculation's mixed-unit behavior.

## Time and calendar semantics

All Health timestamps require RFC 3339 syntax with an explicit `Z` or numeric offset. Validation, service range filters, upcoming checks, newest-measurement selection, memory ordering, and inclusive memory ranges compare absolute instants. Offsets that represent the same instant compare equally, and fractional ordering remains exact through nanoseconds.

Date-only behavior is contract-specific. A daily Health summary treats its measurement and vital ranges as the requested UTC day. Nutrition and hydration `ByDate` queries match the calendar prefix recorded in each timestamp, retaining the caller's stated calendar date even when the offset maps to another UTC date.

Web `datetime-local` values are interpreted in the browser's local timezone and normalized to UTC before service validation. Mobile accepts explicit-zone text and normalizes valid values before submission. Both platforms display stored instants through the device locale. Invalid text remains unchanged so the shared schemas can return a readable validation error.

## Ownership and errors

Every public workflow receives a validated owner context. Create/query payloads cannot assign an owner, update payloads cannot replace identity fields, parent relationships require records owned by the same context, and repository results are revalidated before leaving the service. Missing and cross-owner records remain indistinguishable through memory reads and mutations.

Application errors retain stable Health codes. Web and mobile map validation issues to field messages, show the same safe repository-failure message, and replace unknown object failures with a generic Health error. Neither preview renders raw validation objects, adapter details, stack traces, or object stringification.

## Accessibility and responsive behavior

Web fields use associated labels, error descriptions, native input constraints, visible focus, alert/status semantics, text-labelled lifecycle states, horizontally scrollable navigation, and one-column form/card layouts below the narrow breakpoint. Reduced-motion preferences suppress spinner animation duration.

Mobile screens use safe-area roots and keyboard-aware scroll containers. Controls have roles, labels, selected/disabled/busy states, error hints, assertive error announcements, and minimum touch heights. Status text is explicit, and color is supplemental. Potentially growing record collections use `FlatList` with stable IDs; bounded cards keep long titles and details readable on narrow screens.

## Medical-safety boundary

Health entities represent user-supplied observations and activities. Calculators return arithmetic values and explicit estimate flags. The previews display factual records, units, counts, durations, lifecycle states, and arithmetic summaries.

No layer diagnoses conditions, labels a value normal or abnormal, establishes clinical thresholds, recommends intake, prescribes exercise, selects an activity factor, estimates medication schedules, or provides nutrition, recovery, training, or medical advice. The Progress route stores achieved personal records and recovery observations because the domain has no future-target entity. Medication reminders remain empty because the approved medication model has no schedule from which to derive them.

## Verification coverage

The Health domain suite inventories every runtime schema case, validates strict boundaries and timestamp ordering, executes all calculations, checks all 137 service methods, lifecycle transitions, relationships, pagination, summaries, ownership, injected time/IDs, and repository-contract violations. The memory suite applies reusable CRUD/ownership/pagination contracts across every repository and adds query, ordering, offset, nanosecond, cloning, isolation, public-import, equipment-usage, and real-service integration coverage.

Web and mobile component suites cover stable providers, isolated owners, navigation surfaces, accessible controls, long text, forms, validation, readable errors, profile and observation workflows, workout/running lifecycles, service-backed summaries, and state persistence across in-feature navigation. Production Next.js compilation checks all routes. Expo checks include lint, type-check, Jest Expo, Expo Doctor, and Android/iOS/web JavaScript exports. Expo Doctor passes 20 of 21 checks; its only finding is the accepted patch-version mismatch for Expo, Expo Crypto, and Expo Router. This Windows host has no ADB runtime and cannot run native iOS, so no native-device claim is made.

## Future durable storage

A future PostgreSQL/Supabase adapter will implement the existing repository interfaces below the service. It must preserve owner isolation, relationship checks, inclusive instant ranges, deterministic ordering with ID tie-breaks, pagination behavior, decimal values and units, and recorded calendar-date semantics. Database authentication and Row Level Security must enforce the owner boundary independently of the application context.

Durable storage must also define migrations, transaction behavior, timestamp/offset preservation, conflict handling, retry policy, synchronization, offline behavior, deletion semantics, backup, restoration, import/export, and test parity against the reusable repository contracts. None of those capabilities is implemented in the memory adapter or previews.

## Known limitations

- All Health data is process-local and disappears when its provider reloads.
- The development owner is synthetic and provides no authentication or authorization.
- Mobile date/time entry uses validated text rather than a native picker.
- Native Android and iOS execution is unverified; only platform bundle exports run on this host.
- There is no database, API, synchronization, import/export, backup, notification scheduler, wearable provider, Strava integration, diagnosis, recommendation engine, deployment, or store package.
