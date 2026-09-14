# Health models and validation — Phase 11

This document records the Phase 11 platform-neutral Health model and structural-validation gate. Runtime schemas use the existing `@aperture/validation` Zod boundary. Phase 12 subsequently implemented the approved calculations; see [Health calculations](HEALTH_CALCULATIONS.md). Lifecycle operations, services, repository implementations, UI, APIs, storage, integrations, clinical interpretation, and recommendations remain outside this Phase 11 inventory.

## Preflight and baseline

- Project: `D:\Hello World\Automations\Personal Dashboard\aperture v2`.
- Branch: `codex/aperture-v2`; starting commit: `f5190180f3d6b486e3404036aa71fbd29f617098`.
- Working tree was clean. `git fetch origin` succeeded; both upstream comparison logs were empty.
- Inspected every Health source/configuration file, public exports, Phase 2 inventory, shared Validation implementation/tests, Education model conventions/tests, phase plan, and architecture documentation before implementation.
- The original Health package has **zero .d.ts source files**: its 137 ambient functions were declared in .ts files. The new types-only compatibility barrel is not a model implementation.
- Baseline: **489 tests across 20 files/suites**: Mobile 18/6, Web 8/4, Education 231/4, Education Memory 227/5, Validation 5/1.
- Baseline workspace type-check and lint passed; Validation, Education, Education Memory, Next.js production build, and Expo web export passed. Package builds also ran as test prerequisites.

## Verified declaration totals and phase classification

The pre-implementation TypeScript AST inventory contains **390 named top-level declarations**. The counts in the Phase 2 report are confirmed: **22 principal entities**, **22 entity identifier aliases**, **126 domain-operation functions**, **11 calculation functions**, **22 entity repositories**, aggregate `HealthRepository`, and **11 HealthService methods**. Total ambient functions: **137**, with **zero** model-validation function declarations and **zero** integration contracts in this package.

There is also `OwnerId`, making **23 identifier schemas**. IDs were plain string aliases with no brand to preserve. Runtime schema types retain string compatibility and readonly model properties.

| Group | Original declarations | Phase 11 treatment |
| --- | ---: | --- |
| 1. Runtime model/entity and supporting shape | 34 | Runtime schemas; generic PageResult uses a schema factory |
| 2. Identifier | 23 | Runtime schemas; generic PageResult uses a schema factory |
| 3. Enum/literal union | 18 | Runtime schemas; generic PageResult uses a schema factory |
| 4. Unit/quantity/recorded scale | 33 | Runtime schemas; generic PageResult uses a schema factory |
| 5. Create/record input | 23 | Runtime schemas; generic PageResult uses a schema factory |
| 6. Update input | 22 | Runtime schemas; generic PageResult uses a schema factory |
| 7. Model query/filter/pagination | 38 | Runtime schemas; generic PageResult uses a schema factory |
| 8. Model-validation function | 0 | Runtime schemas; generic PageResult uses a schema factory |
| 9. Calculation and calculation-only contracts (Phase 12) | 40 | Retained without behavioral implementation |
| 10. Domain lifecycle operation (Phase 13) | 126 | Retained without behavioral implementation |
| 11. Repository contract (Phase 14) | 26 | Retained without behavioral implementation |
| 12. Service/use-case contract (Phase 13) | 7 | Retained without behavioral implementation |
| 13. Integration contract (deferred) | 0 | No contracts found |

Group 9 includes 11 functions and 29 calculation-only types; Group 11 includes 22 entity repositories, the aggregate, and three generic repository interfaces. Group 12 includes HealthService and six service-only summary/query shapes. Service methods are counted separately from top-level declarations.

### Classification decisions

- Calculation-only `BmrSexInput`, `AgeValue`, `ActivityFactorValue`, calculation input/result objects, and their canonical result units remain Phase 12 contracts. Education likewise separates calculation-specific validation from its model phase. Their declarations are retained; no conversion or formula is implemented.
- `EquipmentUsageSummary` is a public supporting model and receives a schema, without computing totals. `RecordEquipmentUsageInput` receives input validation, without implementing recordEquipmentUsage.
- `RepositoryFilter` is an owner-scoped model query alias and receives runtime validation; generic repository interfaces remain types.
- Service-only `DateRangeSummaryQuery` and `UpcomingItemsQuery` stay in Phase 13 alongside their service contracts. Domain entity-list and by-date queries are all implemented.
- No per-entity parse/safe-parse function was declared. Consumers use each schema's `.parse` / `.safeParse`, plus the existing shared `validateInput`, `validateOutput`, and `normalizeValidationError` helpers. No second error framework was added.

## Principal entity, create, and update inventory

There are **22 stored-entity schemas**, **23 create/record schemas** (22 entity inputs plus equipment usage), and **22 update schemas**. Names are preserved from Phase 2: record-oriented inputs are not renamed to Create.

| Entity | Identifier | Entity schema | Create/record input | Update input |
| --- | --- | --- | --- | --- |
| Appointment | AppointmentId | `appointmentSchema` | `CreateAppointmentInput` | `UpdateAppointmentInput` |
| BodyCompositionRecord | BodyCompositionRecordId | `bodyCompositionRecordSchema` | `RecordBodyCompositionInput` | `UpdateBodyCompositionInput` |
| Equipment | EquipmentId | `equipmentSchema` | `CreateEquipmentInput` | `UpdateEquipmentInput` |
| ExerciseSet | ExerciseSetId | `exerciseSetSchema` | `RecordExerciseSetInput` | `UpdateExerciseSetInput` |
| Exercise | ExerciseId | `exerciseSchema` | `CreateExerciseInput` | `UpdateExerciseInput` |
| HydrationEntry | HydrationEntryId | `hydrationEntrySchema` | `RecordHydrationInput` | `UpdateHydrationEntryInput` |
| LaboratoryResult | LaboratoryResultId | `laboratoryResultSchema` | `RecordLaboratoryResultInput` | `UpdateLaboratoryResultInput` |
| HealthMeasurement | HealthMeasurementId | `healthMeasurementSchema` | `RecordHealthMeasurementInput` | `UpdateHealthMeasurementInput` |
| MedicationLog | MedicationLogId | `medicationLogSchema` | `RecordMedicationLogInput` | `UpdateMedicationLogInput` |
| Medication | MedicationId | `medicationSchema` | `CreateMedicationInput` | `UpdateMedicationInput` |
| NutritionEntry | NutritionEntryId | `nutritionEntrySchema` | `CreateNutritionEntryInput` | `UpdateNutritionEntryInput` |
| PersonalRecord | PersonalRecordId | `personalRecordSchema` | `RecordPersonalRecordInput` | `UpdatePersonalRecordInput` |
| HealthProfile | HealthProfileId | `healthProfileSchema` | `CreateHealthProfileInput` | `UpdateHealthProfileInput` |
| RecoveryEntry | RecoveryEntryId | `recoveryEntrySchema` | `RecordRecoveryEntryInput` | `UpdateRecoveryEntryInput` |
| ActivityRoute | ActivityRouteId | `activityRouteSchema` | `CreateActivityRouteInput` | `UpdateActivityRouteInput` |
| RunningActivity | RunningActivityId | `runningActivitySchema` | `CreateRunningActivityInput` | `UpdateRunningActivityInput` |
| RunningSplit | RunningSplitId | `runningSplitSchema` | `RecordRunningSplitInput` | `UpdateRunningSplitInput` |
| SleepRecord | SleepRecordId | `sleepRecordSchema` | `RecordSleepInput` | `UpdateSleepInput` |
| SymptomEntry | SymptomEntryId | `symptomEntrySchema` | `RecordSymptomInput` | `UpdateSymptomEntryInput` |
| VitalReading | VitalReadingId | `vitalReadingSchema` | `RecordVitalReadingInput` | `UpdateVitalReadingInput` |
| WorkoutPlan | WorkoutPlanId | `workoutPlanSchema` | `CreateWorkoutPlanInput` | `UpdateWorkoutPlanInput` |
| WorkoutSession | WorkoutSessionId | `workoutSessionSchema` | `CreateWorkoutSessionInput` | `UpdateWorkoutSessionInput` |

Every original runtime model/input/query declaration listed below maps to a lower-camel-case schema name plus `Schema`; e.g. `RecordSleepInput` → `recordSleepInputSchema`. The exceptions are generic `PageResult<TEntity>`, validated by `pageResultSchema(itemSchema)`, and the documented date aliases.

## Identifier, text, and optional-field conventions

- IDs are opaque ASCII tokens matching `^[A-Za-z0-9][A-Za-z0-9._:-]*$`: UUIDs and namespaced synthetic tokens are accepted. Empty values, whitespace, control characters, slashes, and other unsupported characters reject. This documents the previously unspecified malformed-token boundary; validation neither generates IDs nor asserts existence/authentication.
- Owner ID remains explicit on stored entities, create/record inputs, and owner queries. Update payloads exclude owner and entity ID because Phase 2 operations receive both separately.
- Text must contain at least one non-whitespace character and is preserved verbatim. No UI label, truncation, length cap, or text normalization is invented. Laboratory numeric units remain caller-defined non-empty strings because their contract intentionally has no closed unit list.
- All declared objects reject unknown fields. No model field is declared nullable: null rejects. Optional fields allow omission or explicit undefined, matching Zod/Education conventions; neither means a persistence clearing operation.
- Types infer from runtime schemas with readonly model properties, including nested quantities. Declared model objects and readonly equipment-ID/page-item arrays are defensively parsed and frozen by Zod. Opaque unknown values inside lifecycle-error details retain their original unrestricted contract. This is not a persistence patch or storage mutation API.
- Pagination follows the established 1–100 integer limit convention; cursors are non-empty opaque text.

## Unit and quantity inventory

All **18 model quantity schemas** and **18 standalone unit schemas** are public. Twelve unit aliases already existed; six singleton unit types/schemas now name the exact literals previously embedded in quantities. These add no unit aliases or conversions.

| Quantity | Supported units | Numeric convention |
| --- | --- | --- |
| WeightValue | kilogram, pound | Non-negative decimal; zero supports unloaded workout records |
| HeightValue | centimeter, inch | Positive decimal |
| DistanceValue | meter, kilometer, foot, mile | Non-negative decimal |
| DurationValue | second, minute, hour | Non-negative decimal |
| PaceValue | seconds_per_kilometer, seconds_per_mile | Positive decimal |
| SpeedValue | kilometers_per_hour, miles_per_hour, meters_per_second | Non-negative decimal |
| HeartRateValue | beats_per_minute | Finite non-negative number; no clinical upper bound |
| BloodPressureValue | millimeters_of_mercury | Both finite non-negative systolic/diastolic values; no relative clinical threshold |
| TemperatureValue | celsius, fahrenheit | Signed decimal |
| EnergyValue | kilocalorie, kilojoule | Non-negative decimal |
| HydrationVolumeValue | milliliter, liter, fluid_ounce | Non-negative decimal |
| NutritionMassValue | milligram, gram, ounce | Non-negative decimal |
| BloodGlucoseValue | milligrams_per_deciliter, millimoles_per_liter | Non-negative decimal |
| OxygenSaturationValue | percent | Decimal from 0 through 100 inclusive |
| PercentageValue | percent | Decimal from 0 through 100 inclusive |
| RepetitionCount | repetition | Non-negative safe integer |
| WorkoutLoadValue | kilogram_repetition, pound_repetition | Non-negative decimal |
| HeartRateVariabilityValue | millisecond | Non-negative decimal |

`PerceivedEffort` and `RecoveryRating` carry the exact `one_to_ten` scale (1–10); `SymptomSeverity` carries `zero_to_ten` (0–10). Fractional ratings are allowed because the original contracts declare numbers rather than integer counts. These are user-recorded scales, not generated risk/readiness scores. Sequence positions and usage counts are non-negative safe integers; no one-based sequence requirement was declared.

Plain decimal strings reject exponent notation, leading zeroes, commas, symbols, surrounding whitespace, NaN, and infinity tokens. Finite digit strings retain arbitrary supplied precision, including trailing zeroes and values outside JavaScript Number's representable range. Validation never converts decimals to floating point. Positive checks and percentage bounds inspect digits, so underflow and rounding cannot admit an out-of-range value such as `100.000000000000000001`.

## Enums, statuses, and discriminated values

All **18 named model enum/status schemas** are implemented (including MeasurementSystem, RecordStatus, HealthErrorCode, and VitalReadingType). Exact values appear in the complete declaration inventory below and in the enum test table. Casing changes, padding, and undeclared aliases reject.

VitalReadingValue discriminates on `type` across five shapes; PersonalRecordMetric uses five `type` shapes; LaboratoryResultValue discriminates numeric/text on `kind`. Each branch rejects foreign fields and units. HealthMeasurement carries a separate type and quantity union, so stored/create validation checks their compatibility: weight → WeightValue, height → HeightValue, waist/hip → DistanceValue.


### Exact named enum/status members

| Type | Values |
| --- | --- |
| `HealthErrorCode` | not_found, conflict, invalid_state, unsupported_operation |
| `MeasurementSystem` | metric, imperial |
| `RecordStatus` | active, archived |
| `AppointmentStatus` | scheduled, cancelled, completed |
| `EquipmentCategory` | running_shoes, strength, cardio, mobility, other |
| `EquipmentStatus` | active, retired |
| `ExerciseCategory` | strength, cardio, mobility, balance, other |
| `ExerciseStatus` | active, archived |
| `HealthMeasurementType` | weight, height, waist, hip |
| `MedicationLogStatus` | taken, skipped |
| `MedicationStatus` | active, archived |
| `MealType` | breakfast, lunch, dinner, snack, other |
| `HealthProfileStatus` | active, archived |
| `RunningActivityStatus` | planned, in_progress, completed |
| `SleepQuality` | poor, fair, good, excellent |
| `VitalReadingType` | resting_heart_rate, blood_pressure, blood_glucose, oxygen_saturation, body_temperature |
| `WorkoutPlanStatus` | draft, active, archived |
| `WorkoutSessionStatus` | planned, in_progress, paused, completed, cancelled |

## Temporal and cross-field conventions

- Date-only values are real proleptic Gregorian `YYYY-MM-DD` dates, including leap-year rules, kept as strings.
- Timestamps require uppercase `T`, seconds, and `Z` or a numeric timezone offset. Hours, minutes, seconds, and offsets are range-checked; 24:00 and leap-second notation reject. Fractions may contain 1–9 digits, matching the Education timestamp format.
- Timestamp ordering compares absolute instants with all nine fractional digits; offset strings are not compared lexicographically. Equal endpoints are valid.
- Every stored entity and EntityMetadata requires updatedAt ≥ createdAt.
- DateRange, Appointment, SleepRecord, RunningActivity, and WorkoutSession check interval order where both endpoints exist. WorkoutPlan and Medication check date-only order. Corresponding create/update schemas enforce the same local checks on supplied fields.
- Every update requires at least one defined mutable field. UpdateBodyCompositionInput retains its originally required observedAt instead of silently becoming Partial.
- Immutable relationship fields stay excluded: exercise-set workout/exercise links, running-split activity, medication-log medication, personal-record references, and running-activity workout link. Explicitly mutable workout-plan, running-route, and running-equipment references remain accepted where declared.
- No status/end-time dependency beyond the original shapes is invented: completed workouts/runs do not gain mandatory optional fields. Enforcing lifecycle transitions belongs to Phase 13.

## Structural versus clinical boundary and deferred integrity

This is a tracking model, not a medical device. Schemas do not diagnose, label observations healthy/unhealthy, generate alerts, infer risk, recommend treatment/medication/nutrition/training, or reject an observation because it falls outside a population average. Unusual finite non-negative heart-rate/blood-pressure values and signed laboratory numeric results remain recordable. No clinical hard limits were found in Phase 2.

Services/repositories must later check related-record existence and ownership, owner authorization, duplicate/overlapping records, aggregate consistency, allowed lifecycle transitions, and compatibility of partial updates with stored state. In particular, a measurement update cannot check its immutable stored type, and a single-ended interval update cannot compare an omitted stored endpoint. No schema loads or merges records. No duration, equipment usage, personal record, or summary is computed. Future time-relative rules require an injected clock; validation never consults now.

## Public API and dependency boundary

`@aperture/health` exposes **200 runtime symbols: 199 schema values (including three compatibility/generic aliases) and one generic page schema factory**, plus all public types. The exact list is asserted by `test/public-import.test.ts`. `isoDateSchema` / `isoDateTimeSchema` alias the type-name-aligned schemas, and `identifierSchema` supplies the common ID boundary. Singleton-unit exports are HeartRateUnit, BloodPressureUnit, OxygenSaturationUnit, PercentageUnit, RepetitionUnit, and HeartRateVariabilityUnit, with corresponding lower-camel-case Schema exports.

Existing model, input, and query import paths remain valid. Repository/service/calculation types remain available from the root. The 137 deferred function signatures remain source declarations and are available only through the types-only `@aperture/health/contracts` compatibility entry. They are no longer invalid runtime exports from the root. Runtime imports must never resolve an ambient-only function.

Internal primitive/refinement helpers are not barrel-exported. The production TypeScript configuration excludes browser libraries and Node ambient types, checking the platform-neutral dependency direction: Health → Validation → existing Zod. No new external dependency was installed. The only manifest/lockfile dependency change links Health to existing `@aperture/validation@0.5.0`; all external dependency records and web/mobile manifests remain unchanged.

## Validation errors

Schema safeParse returns the established Zod result; parse throws ZodError. Shared validateInput/validateOutput produce `{ success: true, value }` or `{ success: false, issues: [{ code, message, path }] }`. normalizeValidationError yields only name, message, and issues, with no stack. Tests verify deterministic issue ordering, nested field/index paths, useful Zod codes, neutral messages, and no object-string coercion. HealthDomainError retains its separate existing lifecycle-error contract; its schema does not replace the shared validation result format.

## Testing and verification

Contract-derived synthetic fixtures cover every original model/input/query/quantity shape, all required and optional fields, unknown fields, primitive mismatch, IDs, timestamps, units, empty updates, metadata mutation, and relationship restrictions. Table-driven tests cover every enum/unit member and mathematical boundaries; focused tests cover discriminated branches, full decimal precision, offsets and nanoseconds, error behavior, and public imports/types. Tests do not inspect private schema internals. No new coverage framework is configured.

Final verification on **2026-09-14**:

| Check | Result |
| --- | --- |
| Health tests | 4,098 passed / 4 files |
| Validation tests | 5 passed / 1 file |
| Education tests | 231 passed / 4 files |
| Education Memory tests | 227 passed / 5 files |
| Web tests | 8 passed / 4 files |
| Mobile tests | 18 passed / 6 suites |
| Full workspace tests | **4,587 passed / 24 files or suites**; all 489 baseline tests retained |
| Workspace type-check | Passed; final Health readonly changes also checked separately |
| Workspace lint | Passed, zero warnings; final Health lint passed |
| Health and Validation builds | Passed |
| Education and Education Memory builds | Passed |
| Next.js production regression | Passed; 11 static pages generated |
| Expo web export (standard workspace script) | Passed |
| Full dependency audit | Completed: 13 moderate, 0 high, 0 critical; unchanged accepted Expo tree |
| Web production dependency audit | Completed: 0 vulnerabilities |
| Declaration/implementation audit | Passed; 137 signatures retained unchanged, 22 entities, 23 IDs, 22 entity repositories, 11 service methods; no runtime dependency cycles or forbidden platform imports |
| Diff whitespace and scope audit | Passed; no Education, Finance, Validation, web, or mobile source changes |

**Supplemental Expo compatibility checks are not green.** On September 14, expo-doctor passed 20/21 checks and failed its SDK patch-version comparison; expo install --check also exited 1. Installed → expected: Expo 57.0.19 → ~57.0.22, Expo Crypto 57.0.2 → ~57.0.3, Expo Router 57.0.18 → ~57.0.21. These are pre-existing dependency versions: application manifests and their external lockfile records are byte-for-byte unchanged from the starting commit. The standard mobile test/type-check/lint/export scripts all pass. No upgrade or exclusion was applied, following the Phase 11 prohibition on unrelated Expo upgrades. This is a disclosed toolchain compatibility caveat, not an all-green supplemental verification result.

The first stricter Health lint run found one pre-existing unused DecimalString import in the BMR declaration file. Only that import was removed; the calculation signature and all calculation behavior remain unchanged/unimplemented. Both audits completed on September 7 and again on September 14; neither final result is an endpoint timeout.

 Health lint uses TypeScript's strict unused-local/parameter checks; existing web/mobile lint continues to use ESLint. Production builds emit only ignored dist output; logs, temporary inventory tools, and audit JSON are kept outside the repository.

## Deferred work and limitations

- Phase 12: all 11 Health calculations, their calculation-specific schemas, and unit conversions.
- Phase 13: all 126 lifecycle operations, 11 service methods, injected clocks/IDs, cross-entity integrity, and stored-state validation.
- Phase 14: all Health repository implementations, including in-memory adapters.
- Phase 15: Health web UI.
- Phase 16: Health mobile UI.
- APIs, durable persistence, authentication, device/vendor integrations, recommendations, medical interpretation, deployment, and publishing are outside Phase 11.

## Complete original declaration inventory

The following rows account for every named declaration inventoried before implementation. Runtime schemas use the naming rule above; phase-deferred rows retain their original contracts. Embedded discriminants/singleton units are validated by their enclosing schemas and tested explicitly.

### 1. Runtime model/entity and supporting shape

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `HealthDomainError` | `health.errors.ts` | `healthDomainErrorSchema` |
| `IsoDateString` | `health.types.ts` | `isoDateStringSchema` |
| `IsoDateTimeString` | `health.types.ts` | `isoDateTimeStringSchema` |
| `DecimalString` | `health.types.ts` | `decimalStringSchema` |
| `EntityMetadata` | `health.types.ts` | `entityMetadataSchema` |
| `DateRange` | `health.types.ts` | `dateRangeSchema` |
| `PageResult` | `health.types.ts` | `pageResultSchema` |
| `Appointment` | `appointments/appointment.types.ts` | `appointmentSchema` |
| `BodyCompositionRecord` | `body-composition/body-composition.types.ts` | `bodyCompositionRecordSchema` |
| `Equipment` | `equipment/equipment.types.ts` | `equipmentSchema` |
| `EquipmentUsageSummary` | `equipment/equipment.types.ts` | `equipmentUsageSummarySchema` |
| `ExerciseSet` | `exercise-sets/exercise-set.types.ts` | `exerciseSetSchema` |
| `Exercise` | `exercises/exercise.types.ts` | `exerciseSchema` |
| `HydrationEntry` | `hydration/hydration-entry.types.ts` | `hydrationEntrySchema` |
| `LaboratoryResultValue` | `laboratory-results/laboratory-result.types.ts` | `laboratoryResultValueSchema` |
| `LaboratoryResult` | `laboratory-results/laboratory-result.types.ts` | `laboratoryResultSchema` |
| `HealthMeasurementValue` | `measurements/health-measurement.types.ts` | `healthMeasurementValueSchema` |
| `HealthMeasurement` | `measurements/health-measurement.types.ts` | `healthMeasurementSchema` |
| `MedicationLog` | `medications/medication-log.types.ts` | `medicationLogSchema` |
| `Medication` | `medications/medication.types.ts` | `medicationSchema` |
| `NutritionEntry` | `nutrition/nutrition-entry.types.ts` | `nutritionEntrySchema` |
| `PersonalRecordMetric` | `personal-records/personal-record.types.ts` | `personalRecordMetricSchema` |
| `PersonalRecord` | `personal-records/personal-record.types.ts` | `personalRecordSchema` |
| `HealthProfile` | `profiles/health-profile.types.ts` | `healthProfileSchema` |
| `RecoveryEntry` | `recovery/recovery-entry.types.ts` | `recoveryEntrySchema` |
| `ActivityRoute` | `routes/activity-route.types.ts` | `activityRouteSchema` |
| `RunningActivity` | `running/running-activity.types.ts` | `runningActivitySchema` |
| `RunningSplit` | `running-splits/running-split.types.ts` | `runningSplitSchema` |
| `SleepRecord` | `sleep/sleep-record.types.ts` | `sleepRecordSchema` |
| `SymptomEntry` | `symptoms/symptom-entry.types.ts` | `symptomEntrySchema` |
| `VitalReadingValue` | `vitals/vital-reading.types.ts` | `vitalReadingValueSchema` |
| `VitalReading` | `vitals/vital-reading.types.ts` | `vitalReadingSchema` |
| `WorkoutPlan` | `workout-plans/workout-plan.types.ts` | `workoutPlanSchema` |
| `WorkoutSession` | `workouts/workout-session.types.ts` | `workoutSessionSchema` |

### 2. Identifier

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `OwnerId` | `health.types.ts` | `ownerIdSchema` |
| `AppointmentId` | `appointments/appointment.types.ts` | `appointmentIdSchema` |
| `BodyCompositionRecordId` | `body-composition/body-composition.types.ts` | `bodyCompositionRecordIdSchema` |
| `EquipmentId` | `equipment/equipment.types.ts` | `equipmentIdSchema` |
| `ExerciseSetId` | `exercise-sets/exercise-set.types.ts` | `exerciseSetIdSchema` |
| `ExerciseId` | `exercises/exercise.types.ts` | `exerciseIdSchema` |
| `HydrationEntryId` | `hydration/hydration-entry.types.ts` | `hydrationEntryIdSchema` |
| `LaboratoryResultId` | `laboratory-results/laboratory-result.types.ts` | `laboratoryResultIdSchema` |
| `HealthMeasurementId` | `measurements/health-measurement.types.ts` | `healthMeasurementIdSchema` |
| `MedicationLogId` | `medications/medication-log.types.ts` | `medicationLogIdSchema` |
| `MedicationId` | `medications/medication.types.ts` | `medicationIdSchema` |
| `NutritionEntryId` | `nutrition/nutrition-entry.types.ts` | `nutritionEntryIdSchema` |
| `PersonalRecordId` | `personal-records/personal-record.types.ts` | `personalRecordIdSchema` |
| `HealthProfileId` | `profiles/health-profile.types.ts` | `healthProfileIdSchema` |
| `RecoveryEntryId` | `recovery/recovery-entry.types.ts` | `recoveryEntryIdSchema` |
| `ActivityRouteId` | `routes/activity-route.types.ts` | `activityRouteIdSchema` |
| `RunningActivityId` | `running/running-activity.types.ts` | `runningActivityIdSchema` |
| `RunningSplitId` | `running-splits/running-split.types.ts` | `runningSplitIdSchema` |
| `SleepRecordId` | `sleep/sleep-record.types.ts` | `sleepRecordIdSchema` |
| `SymptomEntryId` | `symptoms/symptom-entry.types.ts` | `symptomEntryIdSchema` |
| `VitalReadingId` | `vitals/vital-reading.types.ts` | `vitalReadingIdSchema` |
| `WorkoutPlanId` | `workout-plans/workout-plan.types.ts` | `workoutPlanIdSchema` |
| `WorkoutSessionId` | `workouts/workout-session.types.ts` | `workoutSessionIdSchema` |

### 3. Enum/literal union

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `HealthErrorCode` | `health.errors.ts` | `healthErrorCodeSchema` |
| `MeasurementSystem` | `health.types.ts` | `measurementSystemSchema` |
| `RecordStatus` | `health.types.ts` | `recordStatusSchema` |
| `AppointmentStatus` | `appointments/appointment.types.ts` | `appointmentStatusSchema` |
| `EquipmentCategory` | `equipment/equipment.types.ts` | `equipmentCategorySchema` |
| `EquipmentStatus` | `equipment/equipment.types.ts` | `equipmentStatusSchema` |
| `ExerciseCategory` | `exercises/exercise.types.ts` | `exerciseCategorySchema` |
| `ExerciseStatus` | `exercises/exercise.types.ts` | `exerciseStatusSchema` |
| `HealthMeasurementType` | `measurements/health-measurement.types.ts` | `healthMeasurementTypeSchema` |
| `MedicationLogStatus` | `medications/medication-log.types.ts` | `medicationLogStatusSchema` |
| `MedicationStatus` | `medications/medication.types.ts` | `medicationStatusSchema` |
| `MealType` | `nutrition/nutrition-entry.types.ts` | `mealTypeSchema` |
| `HealthProfileStatus` | `profiles/health-profile.types.ts` | `healthProfileStatusSchema` |
| `RunningActivityStatus` | `running/running-activity.types.ts` | `runningActivityStatusSchema` |
| `SleepQuality` | `sleep/sleep-record.types.ts` | `sleepQualitySchema` |
| `VitalReadingType` | `vitals/vital-reading.types.ts` | `vitalReadingTypeSchema` |
| `WorkoutPlanStatus` | `workout-plans/workout-plan.types.ts` | `workoutPlanStatusSchema` |
| `WorkoutSessionStatus` | `workouts/workout-session.types.ts` | `workoutSessionStatusSchema` |

### 4. Unit/quantity/recorded scale

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `WeightUnit` | `health-units.types.ts` | `weightUnitSchema` |
| `WeightValue` | `health-units.types.ts` | `weightValueSchema` |
| `HeightUnit` | `health-units.types.ts` | `heightUnitSchema` |
| `HeightValue` | `health-units.types.ts` | `heightValueSchema` |
| `DistanceUnit` | `health-units.types.ts` | `distanceUnitSchema` |
| `DistanceValue` | `health-units.types.ts` | `distanceValueSchema` |
| `DurationUnit` | `health-units.types.ts` | `durationUnitSchema` |
| `DurationValue` | `health-units.types.ts` | `durationValueSchema` |
| `PaceUnit` | `health-units.types.ts` | `paceUnitSchema` |
| `PaceValue` | `health-units.types.ts` | `paceValueSchema` |
| `SpeedUnit` | `health-units.types.ts` | `speedUnitSchema` |
| `SpeedValue` | `health-units.types.ts` | `speedValueSchema` |
| `HeartRateValue` | `health-units.types.ts` | `heartRateValueSchema` |
| `BloodPressureValue` | `health-units.types.ts` | `bloodPressureValueSchema` |
| `TemperatureUnit` | `health-units.types.ts` | `temperatureUnitSchema` |
| `TemperatureValue` | `health-units.types.ts` | `temperatureValueSchema` |
| `EnergyUnit` | `health-units.types.ts` | `energyUnitSchema` |
| `EnergyValue` | `health-units.types.ts` | `energyValueSchema` |
| `HydrationVolumeUnit` | `health-units.types.ts` | `hydrationVolumeUnitSchema` |
| `HydrationVolumeValue` | `health-units.types.ts` | `hydrationVolumeValueSchema` |
| `NutritionMassUnit` | `health-units.types.ts` | `nutritionMassUnitSchema` |
| `NutritionMassValue` | `health-units.types.ts` | `nutritionMassValueSchema` |
| `BloodGlucoseUnit` | `health-units.types.ts` | `bloodGlucoseUnitSchema` |
| `BloodGlucoseValue` | `health-units.types.ts` | `bloodGlucoseValueSchema` |
| `OxygenSaturationValue` | `health-units.types.ts` | `oxygenSaturationValueSchema` |
| `PercentageValue` | `health-units.types.ts` | `percentageValueSchema` |
| `RepetitionCount` | `health-units.types.ts` | `repetitionCountSchema` |
| `WorkoutLoadUnit` | `health-units.types.ts` | `workoutLoadUnitSchema` |
| `WorkoutLoadValue` | `health-units.types.ts` | `workoutLoadValueSchema` |
| `HeartRateVariabilityValue` | `health-units.types.ts` | `heartRateVariabilityValueSchema` |
| `PerceivedEffort` | `exercise-sets/exercise-set.types.ts` | `perceivedEffortSchema` |
| `RecoveryRating` | `recovery/recovery-entry.types.ts` | `recoveryRatingSchema` |
| `SymptomSeverity` | `symptoms/symptom-entry.types.ts` | `symptomSeveritySchema` |

### 5. Create/record input

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `CreateAppointmentInput` | `appointments/appointment.contracts.ts` | `createAppointmentInputSchema` |
| `RecordBodyCompositionInput` | `body-composition/body-composition.contracts.ts` | `recordBodyCompositionInputSchema` |
| `CreateEquipmentInput` | `equipment/equipment.contracts.ts` | `createEquipmentInputSchema` |
| `RecordEquipmentUsageInput` | `equipment/equipment.contracts.ts` | `recordEquipmentUsageInputSchema` |
| `RecordExerciseSetInput` | `exercise-sets/exercise-set.contracts.ts` | `recordExerciseSetInputSchema` |
| `CreateExerciseInput` | `exercises/exercise.contracts.ts` | `createExerciseInputSchema` |
| `RecordHydrationInput` | `hydration/hydration-entry.contracts.ts` | `recordHydrationInputSchema` |
| `RecordLaboratoryResultInput` | `laboratory-results/laboratory-result.contracts.ts` | `recordLaboratoryResultInputSchema` |
| `RecordHealthMeasurementInput` | `measurements/health-measurement.contracts.ts` | `recordHealthMeasurementInputSchema` |
| `CreateMedicationInput` | `medications/medication.contracts.ts` | `createMedicationInputSchema` |
| `RecordMedicationLogInput` | `medications/medication.contracts.ts` | `recordMedicationLogInputSchema` |
| `CreateNutritionEntryInput` | `nutrition/nutrition-entry.contracts.ts` | `createNutritionEntryInputSchema` |
| `RecordPersonalRecordInput` | `personal-records/personal-record.contracts.ts` | `recordPersonalRecordInputSchema` |
| `CreateHealthProfileInput` | `profiles/health-profile.contracts.ts` | `createHealthProfileInputSchema` |
| `RecordRecoveryEntryInput` | `recovery/recovery-entry.contracts.ts` | `recordRecoveryEntryInputSchema` |
| `CreateActivityRouteInput` | `routes/activity-route.contracts.ts` | `createActivityRouteInputSchema` |
| `CreateRunningActivityInput` | `running/running-activity.contracts.ts` | `createRunningActivityInputSchema` |
| `RecordRunningSplitInput` | `running-splits/running-split.contracts.ts` | `recordRunningSplitInputSchema` |
| `RecordSleepInput` | `sleep/sleep-record.contracts.ts` | `recordSleepInputSchema` |
| `RecordSymptomInput` | `symptoms/symptom-entry.contracts.ts` | `recordSymptomInputSchema` |
| `RecordVitalReadingInput` | `vitals/vital-reading.contracts.ts` | `recordVitalReadingInputSchema` |
| `CreateWorkoutPlanInput` | `workout-plans/workout-plan.contracts.ts` | `createWorkoutPlanInputSchema` |
| `CreateWorkoutSessionInput` | `workouts/workout-session.contracts.ts` | `createWorkoutSessionInputSchema` |

### 6. Update input

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `UpdateAppointmentInput` | `appointments/appointment.contracts.ts` | `updateAppointmentInputSchema` |
| `UpdateBodyCompositionInput` | `body-composition/body-composition.contracts.ts` | `updateBodyCompositionInputSchema` |
| `UpdateEquipmentInput` | `equipment/equipment.contracts.ts` | `updateEquipmentInputSchema` |
| `UpdateExerciseSetInput` | `exercise-sets/exercise-set.contracts.ts` | `updateExerciseSetInputSchema` |
| `UpdateExerciseInput` | `exercises/exercise.contracts.ts` | `updateExerciseInputSchema` |
| `UpdateHydrationEntryInput` | `hydration/hydration-entry.contracts.ts` | `updateHydrationEntryInputSchema` |
| `UpdateLaboratoryResultInput` | `laboratory-results/laboratory-result.contracts.ts` | `updateLaboratoryResultInputSchema` |
| `UpdateHealthMeasurementInput` | `measurements/health-measurement.contracts.ts` | `updateHealthMeasurementInputSchema` |
| `UpdateMedicationInput` | `medications/medication.contracts.ts` | `updateMedicationInputSchema` |
| `UpdateMedicationLogInput` | `medications/medication.contracts.ts` | `updateMedicationLogInputSchema` |
| `UpdateNutritionEntryInput` | `nutrition/nutrition-entry.contracts.ts` | `updateNutritionEntryInputSchema` |
| `UpdatePersonalRecordInput` | `personal-records/personal-record.contracts.ts` | `updatePersonalRecordInputSchema` |
| `UpdateHealthProfileInput` | `profiles/health-profile.contracts.ts` | `updateHealthProfileInputSchema` |
| `UpdateRecoveryEntryInput` | `recovery/recovery-entry.contracts.ts` | `updateRecoveryEntryInputSchema` |
| `UpdateActivityRouteInput` | `routes/activity-route.contracts.ts` | `updateActivityRouteInputSchema` |
| `UpdateRunningActivityInput` | `running/running-activity.contracts.ts` | `updateRunningActivityInputSchema` |
| `UpdateRunningSplitInput` | `running-splits/running-split.contracts.ts` | `updateRunningSplitInputSchema` |
| `UpdateSleepInput` | `sleep/sleep-record.contracts.ts` | `updateSleepInputSchema` |
| `UpdateSymptomEntryInput` | `symptoms/symptom-entry.contracts.ts` | `updateSymptomEntryInputSchema` |
| `UpdateVitalReadingInput` | `vitals/vital-reading.contracts.ts` | `updateVitalReadingInputSchema` |
| `UpdateWorkoutPlanInput` | `workout-plans/workout-plan.contracts.ts` | `updateWorkoutPlanInputSchema` |
| `UpdateWorkoutSessionInput` | `workouts/workout-session.contracts.ts` | `updateWorkoutSessionInputSchema` |

### 7. Model query/filter/pagination

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `PageRequest` | `health.types.ts` | `pageRequestSchema` |
| `OwnerQuery` | `health.types.ts` | `ownerQuerySchema` |
| `AppointmentListQuery` | `appointments/appointment.contracts.ts` | `appointmentListQuerySchema` |
| `UpcomingAppointmentsQuery` | `appointments/appointment.contracts.ts` | `upcomingAppointmentsQuerySchema` |
| `BodyCompositionListQuery` | `body-composition/body-composition.contracts.ts` | `bodyCompositionListQuerySchema` |
| `EquipmentListQuery` | `equipment/equipment.contracts.ts` | `equipmentListQuerySchema` |
| `ExerciseSetListQuery` | `exercise-sets/exercise-set.contracts.ts` | `exerciseSetListQuerySchema` |
| `ExerciseSetsByWorkoutQuery` | `exercise-sets/exercise-set.contracts.ts` | `exerciseSetsByWorkoutQuerySchema` |
| `ExerciseSetsByExerciseQuery` | `exercise-sets/exercise-set.contracts.ts` | `exerciseSetsByExerciseQuerySchema` |
| `ExerciseListQuery` | `exercises/exercise.contracts.ts` | `exerciseListQuerySchema` |
| `ExercisesByCategoryQuery` | `exercises/exercise.contracts.ts` | `exercisesByCategoryQuerySchema` |
| `HydrationEntryListQuery` | `hydration/hydration-entry.contracts.ts` | `hydrationEntryListQuerySchema` |
| `HydrationEntriesByDateQuery` | `hydration/hydration-entry.contracts.ts` | `hydrationEntriesByDateQuerySchema` |
| `LaboratoryResultListQuery` | `laboratory-results/laboratory-result.contracts.ts` | `laboratoryResultListQuerySchema` |
| `HealthMeasurementListQuery` | `measurements/health-measurement.contracts.ts` | `healthMeasurementListQuerySchema` |
| `HealthMeasurementsByTypeQuery` | `measurements/health-measurement.contracts.ts` | `healthMeasurementsByTypeQuerySchema` |
| `HealthMeasurementsByDateRangeQuery` | `measurements/health-measurement.contracts.ts` | `healthMeasurementsByDateRangeQuerySchema` |
| `MedicationListQuery` | `medications/medication.contracts.ts` | `medicationListQuerySchema` |
| `MedicationLogListQuery` | `medications/medication.contracts.ts` | `medicationLogListQuerySchema` |
| `NutritionEntryListQuery` | `nutrition/nutrition-entry.contracts.ts` | `nutritionEntryListQuerySchema` |
| `NutritionEntriesByDateQuery` | `nutrition/nutrition-entry.contracts.ts` | `nutritionEntriesByDateQuerySchema` |
| `PersonalRecordListQuery` | `personal-records/personal-record.contracts.ts` | `personalRecordListQuerySchema` |
| `RecoveryEntryListQuery` | `recovery/recovery-entry.contracts.ts` | `recoveryEntryListQuerySchema` |
| `RepositoryFilter` | `repositories/repository.types.ts` | `repositoryFilterSchema` |
| `ActivityRouteListQuery` | `routes/activity-route.contracts.ts` | `activityRouteListQuerySchema` |
| `RunningActivityListQuery` | `running/running-activity.contracts.ts` | `runningActivityListQuerySchema` |
| `RunningActivitiesByDateRangeQuery` | `running/running-activity.contracts.ts` | `runningActivitiesByDateRangeQuerySchema` |
| `RunningSplitListQuery` | `running-splits/running-split.contracts.ts` | `runningSplitListQuerySchema` |
| `RunningSplitsByActivityQuery` | `running-splits/running-split.contracts.ts` | `runningSplitsByActivityQuerySchema` |
| `SleepRecordListQuery` | `sleep/sleep-record.contracts.ts` | `sleepRecordListQuerySchema` |
| `SleepRecordsByDateRangeQuery` | `sleep/sleep-record.contracts.ts` | `sleepRecordsByDateRangeQuerySchema` |
| `SymptomEntryListQuery` | `symptoms/symptom-entry.contracts.ts` | `symptomEntryListQuerySchema` |
| `VitalReadingListQuery` | `vitals/vital-reading.contracts.ts` | `vitalReadingListQuerySchema` |
| `VitalReadingsByTypeQuery` | `vitals/vital-reading.contracts.ts` | `vitalReadingsByTypeQuerySchema` |
| `VitalReadingsByDateRangeQuery` | `vitals/vital-reading.contracts.ts` | `vitalReadingsByDateRangeQuerySchema` |
| `WorkoutPlanListQuery` | `workout-plans/workout-plan.contracts.ts` | `workoutPlanListQuerySchema` |
| `WorkoutSessionListQuery` | `workouts/workout-session.contracts.ts` | `workoutSessionListQuerySchema` |
| `WorkoutSessionsByDateRangeQuery` | `workouts/workout-session.contracts.ts` | `workoutSessionsByDateRangeQuerySchema` |

### 8. Model-validation function

None declared.

### 9. Calculation and calculation-only contracts (Phase 12)

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `BmiInput` | `calculations/bmi.contracts.ts` | Deferred |
| `BmiResult` | `calculations/bmi.contracts.ts` | Deferred |
| `calculateBmi` | `calculations/bmi.contracts.ts` | Deferred |
| `BmrSexInput` | `calculations/bmr.contracts.ts` | Deferred |
| `AgeValue` | `calculations/bmr.contracts.ts` | Deferred |
| `BmrInput` | `calculations/bmr.contracts.ts` | Deferred |
| `BmrResult` | `calculations/bmr.contracts.ts` | Deferred |
| `calculateBmr` | `calculations/bmr.contracts.ts` | Deferred |
| `HeartRateZonesInput` | `calculations/heart-rate-zones.contracts.ts` | Deferred |
| `HeartRateZoneResult` | `calculations/heart-rate-zones.contracts.ts` | Deferred |
| `HeartRateZonesResult` | `calculations/heart-rate-zones.contracts.ts` | Deferred |
| `calculateHeartRateZones` | `calculations/heart-rate-zones.contracts.ts` | Deferred |
| `HydrationSummaryInput` | `calculations/hydration-summary.contracts.ts` | Deferred |
| `HydrationSummaryResult` | `calculations/hydration-summary.contracts.ts` | Deferred |
| `calculateHydrationSummary` | `calculations/hydration-summary.contracts.ts` | Deferred |
| `OneRepMaxInput` | `calculations/one-rep-max.contracts.ts` | Deferred |
| `OneRepMaxResult` | `calculations/one-rep-max.contracts.ts` | Deferred |
| `estimateOneRepMax` | `calculations/one-rep-max.contracts.ts` | Deferred |
| `RecoverySummaryEntryInput` | `calculations/recovery-summary.contracts.ts` | Deferred |
| `RecoverySummaryInput` | `calculations/recovery-summary.contracts.ts` | Deferred |
| `RecoverySummaryResult` | `calculations/recovery-summary.contracts.ts` | Deferred |
| `calculateRecoverySummary` | `calculations/recovery-summary.contracts.ts` | Deferred |
| `RunningPaceInput` | `calculations/running-pace.contracts.ts` | Deferred |
| `RunningPaceResult` | `calculations/running-pace.contracts.ts` | Deferred |
| `calculateRunningPace` | `calculations/running-pace.contracts.ts` | Deferred |
| `RunningSummaryActivityInput` | `calculations/running-summary.contracts.ts` | Deferred |
| `RunningSummaryInput` | `calculations/running-summary.contracts.ts` | Deferred |
| `RunningSummaryResult` | `calculations/running-summary.contracts.ts` | Deferred |
| `calculateRunningSummary` | `calculations/running-summary.contracts.ts` | Deferred |
| `SleepSummaryInput` | `calculations/sleep-summary.contracts.ts` | Deferred |
| `SleepSummaryResult` | `calculations/sleep-summary.contracts.ts` | Deferred |
| `calculateSleepSummary` | `calculations/sleep-summary.contracts.ts` | Deferred |
| `ActivityFactorValue` | `calculations/tdee.contracts.ts` | Deferred |
| `TdeeInput` | `calculations/tdee.contracts.ts` | Deferred |
| `TdeeResult` | `calculations/tdee.contracts.ts` | Deferred |
| `calculateTdee` | `calculations/tdee.contracts.ts` | Deferred |
| `WorkoutVolumeSetInput` | `calculations/workout-volume.contracts.ts` | Deferred |
| `WorkoutVolumeInput` | `calculations/workout-volume.contracts.ts` | Deferred |
| `WorkoutVolumeResult` | `calculations/workout-volume.contracts.ts` | Deferred |
| `calculateWorkoutVolume` | `calculations/workout-volume.contracts.ts` | Deferred |

### 10. Domain lifecycle operation (Phase 13)

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `createAppointment` | `appointments/appointment.contracts.ts` | Deferred |
| `updateAppointment` | `appointments/appointment.contracts.ts` | Deferred |
| `cancelAppointment` | `appointments/appointment.contracts.ts` | Deferred |
| `completeAppointment` | `appointments/appointment.contracts.ts` | Deferred |
| `getAppointment` | `appointments/appointment.contracts.ts` | Deferred |
| `listAppointments` | `appointments/appointment.contracts.ts` | Deferred |
| `listUpcomingAppointments` | `appointments/appointment.contracts.ts` | Deferred |
| `recordBodyComposition` | `body-composition/body-composition.contracts.ts` | Deferred |
| `updateBodyComposition` | `body-composition/body-composition.contracts.ts` | Deferred |
| `deleteBodyComposition` | `body-composition/body-composition.contracts.ts` | Deferred |
| `getBodyComposition` | `body-composition/body-composition.contracts.ts` | Deferred |
| `listBodyCompositionRecords` | `body-composition/body-composition.contracts.ts` | Deferred |
| `createEquipment` | `equipment/equipment.contracts.ts` | Deferred |
| `updateEquipment` | `equipment/equipment.contracts.ts` | Deferred |
| `retireEquipment` | `equipment/equipment.contracts.ts` | Deferred |
| `getEquipment` | `equipment/equipment.contracts.ts` | Deferred |
| `listEquipment` | `equipment/equipment.contracts.ts` | Deferred |
| `recordEquipmentUsage` | `equipment/equipment.contracts.ts` | Deferred |
| `getEquipmentUsageSummary` | `equipment/equipment.contracts.ts` | Deferred |
| `recordExerciseSet` | `exercise-sets/exercise-set.contracts.ts` | Deferred |
| `updateExerciseSet` | `exercise-sets/exercise-set.contracts.ts` | Deferred |
| `deleteExerciseSet` | `exercise-sets/exercise-set.contracts.ts` | Deferred |
| `getExerciseSet` | `exercise-sets/exercise-set.contracts.ts` | Deferred |
| `listExerciseSetsByWorkout` | `exercise-sets/exercise-set.contracts.ts` | Deferred |
| `listExerciseSetsByExercise` | `exercise-sets/exercise-set.contracts.ts` | Deferred |
| `createExercise` | `exercises/exercise.contracts.ts` | Deferred |
| `updateExercise` | `exercises/exercise.contracts.ts` | Deferred |
| `archiveExercise` | `exercises/exercise.contracts.ts` | Deferred |
| `getExercise` | `exercises/exercise.contracts.ts` | Deferred |
| `listExercises` | `exercises/exercise.contracts.ts` | Deferred |
| `listExercisesByCategory` | `exercises/exercise.contracts.ts` | Deferred |
| `recordHydration` | `hydration/hydration-entry.contracts.ts` | Deferred |
| `updateHydrationEntry` | `hydration/hydration-entry.contracts.ts` | Deferred |
| `deleteHydrationEntry` | `hydration/hydration-entry.contracts.ts` | Deferred |
| `getHydrationEntry` | `hydration/hydration-entry.contracts.ts` | Deferred |
| `listHydrationEntries` | `hydration/hydration-entry.contracts.ts` | Deferred |
| `listHydrationEntriesByDate` | `hydration/hydration-entry.contracts.ts` | Deferred |
| `recordLaboratoryResult` | `laboratory-results/laboratory-result.contracts.ts` | Deferred |
| `updateLaboratoryResult` | `laboratory-results/laboratory-result.contracts.ts` | Deferred |
| `deleteLaboratoryResult` | `laboratory-results/laboratory-result.contracts.ts` | Deferred |
| `getLaboratoryResult` | `laboratory-results/laboratory-result.contracts.ts` | Deferred |
| `listLaboratoryResults` | `laboratory-results/laboratory-result.contracts.ts` | Deferred |
| `recordHealthMeasurement` | `measurements/health-measurement.contracts.ts` | Deferred |
| `updateHealthMeasurement` | `measurements/health-measurement.contracts.ts` | Deferred |
| `deleteHealthMeasurement` | `measurements/health-measurement.contracts.ts` | Deferred |
| `getHealthMeasurement` | `measurements/health-measurement.contracts.ts` | Deferred |
| `listHealthMeasurements` | `measurements/health-measurement.contracts.ts` | Deferred |
| `listHealthMeasurementsByType` | `measurements/health-measurement.contracts.ts` | Deferred |
| `listHealthMeasurementsByDateRange` | `measurements/health-measurement.contracts.ts` | Deferred |
| `createMedication` | `medications/medication.contracts.ts` | Deferred |
| `updateMedication` | `medications/medication.contracts.ts` | Deferred |
| `archiveMedication` | `medications/medication.contracts.ts` | Deferred |
| `getMedication` | `medications/medication.contracts.ts` | Deferred |
| `listMedications` | `medications/medication.contracts.ts` | Deferred |
| `recordMedicationTaken` | `medications/medication.contracts.ts` | Deferred |
| `recordMedicationSkipped` | `medications/medication.contracts.ts` | Deferred |
| `updateMedicationLog` | `medications/medication.contracts.ts` | Deferred |
| `listMedicationLogs` | `medications/medication.contracts.ts` | Deferred |
| `createNutritionEntry` | `nutrition/nutrition-entry.contracts.ts` | Deferred |
| `updateNutritionEntry` | `nutrition/nutrition-entry.contracts.ts` | Deferred |
| `deleteNutritionEntry` | `nutrition/nutrition-entry.contracts.ts` | Deferred |
| `getNutritionEntry` | `nutrition/nutrition-entry.contracts.ts` | Deferred |
| `listNutritionEntries` | `nutrition/nutrition-entry.contracts.ts` | Deferred |
| `listNutritionEntriesByDate` | `nutrition/nutrition-entry.contracts.ts` | Deferred |
| `recordPersonalRecord` | `personal-records/personal-record.contracts.ts` | Deferred |
| `updatePersonalRecord` | `personal-records/personal-record.contracts.ts` | Deferred |
| `deletePersonalRecord` | `personal-records/personal-record.contracts.ts` | Deferred |
| `getPersonalRecord` | `personal-records/personal-record.contracts.ts` | Deferred |
| `listPersonalRecords` | `personal-records/personal-record.contracts.ts` | Deferred |
| `createHealthProfile` | `profiles/health-profile.contracts.ts` | Deferred |
| `updateHealthProfile` | `profiles/health-profile.contracts.ts` | Deferred |
| `getHealthProfile` | `profiles/health-profile.contracts.ts` | Deferred |
| `recordRecoveryEntry` | `recovery/recovery-entry.contracts.ts` | Deferred |
| `updateRecoveryEntry` | `recovery/recovery-entry.contracts.ts` | Deferred |
| `deleteRecoveryEntry` | `recovery/recovery-entry.contracts.ts` | Deferred |
| `getRecoveryEntry` | `recovery/recovery-entry.contracts.ts` | Deferred |
| `listRecoveryEntries` | `recovery/recovery-entry.contracts.ts` | Deferred |
| `createActivityRoute` | `routes/activity-route.contracts.ts` | Deferred |
| `updateActivityRoute` | `routes/activity-route.contracts.ts` | Deferred |
| `deleteActivityRoute` | `routes/activity-route.contracts.ts` | Deferred |
| `getActivityRoute` | `routes/activity-route.contracts.ts` | Deferred |
| `listActivityRoutes` | `routes/activity-route.contracts.ts` | Deferred |
| `createRunningActivity` | `running/running-activity.contracts.ts` | Deferred |
| `updateRunningActivity` | `running/running-activity.contracts.ts` | Deferred |
| `completeRunningActivity` | `running/running-activity.contracts.ts` | Deferred |
| `deleteRunningActivity` | `running/running-activity.contracts.ts` | Deferred |
| `getRunningActivity` | `running/running-activity.contracts.ts` | Deferred |
| `listRunningActivities` | `running/running-activity.contracts.ts` | Deferred |
| `listRunningActivitiesByDateRange` | `running/running-activity.contracts.ts` | Deferred |
| `recordRunningSplit` | `running-splits/running-split.contracts.ts` | Deferred |
| `updateRunningSplit` | `running-splits/running-split.contracts.ts` | Deferred |
| `deleteRunningSplit` | `running-splits/running-split.contracts.ts` | Deferred |
| `listRunningSplitsByActivity` | `running-splits/running-split.contracts.ts` | Deferred |
| `recordSleep` | `sleep/sleep-record.contracts.ts` | Deferred |
| `updateSleep` | `sleep/sleep-record.contracts.ts` | Deferred |
| `deleteSleep` | `sleep/sleep-record.contracts.ts` | Deferred |
| `getSleepRecord` | `sleep/sleep-record.contracts.ts` | Deferred |
| `listSleepRecords` | `sleep/sleep-record.contracts.ts` | Deferred |
| `listSleepRecordsByDateRange` | `sleep/sleep-record.contracts.ts` | Deferred |
| `recordSymptom` | `symptoms/symptom-entry.contracts.ts` | Deferred |
| `updateSymptomEntry` | `symptoms/symptom-entry.contracts.ts` | Deferred |
| `deleteSymptomEntry` | `symptoms/symptom-entry.contracts.ts` | Deferred |
| `getSymptomEntry` | `symptoms/symptom-entry.contracts.ts` | Deferred |
| `listSymptomEntries` | `symptoms/symptom-entry.contracts.ts` | Deferred |
| `recordVitalReading` | `vitals/vital-reading.contracts.ts` | Deferred |
| `updateVitalReading` | `vitals/vital-reading.contracts.ts` | Deferred |
| `deleteVitalReading` | `vitals/vital-reading.contracts.ts` | Deferred |
| `getVitalReading` | `vitals/vital-reading.contracts.ts` | Deferred |
| `listVitalReadings` | `vitals/vital-reading.contracts.ts` | Deferred |
| `listVitalReadingsByType` | `vitals/vital-reading.contracts.ts` | Deferred |
| `listVitalReadingsByDateRange` | `vitals/vital-reading.contracts.ts` | Deferred |
| `createWorkoutPlan` | `workout-plans/workout-plan.contracts.ts` | Deferred |
| `updateWorkoutPlan` | `workout-plans/workout-plan.contracts.ts` | Deferred |
| `archiveWorkoutPlan` | `workout-plans/workout-plan.contracts.ts` | Deferred |
| `activateWorkoutPlan` | `workout-plans/workout-plan.contracts.ts` | Deferred |
| `getWorkoutPlan` | `workout-plans/workout-plan.contracts.ts` | Deferred |
| `listWorkoutPlans` | `workout-plans/workout-plan.contracts.ts` | Deferred |
| `createWorkoutSession` | `workouts/workout-session.contracts.ts` | Deferred |
| `startWorkout` | `workouts/workout-session.contracts.ts` | Deferred |
| `pauseWorkout` | `workouts/workout-session.contracts.ts` | Deferred |
| `resumeWorkout` | `workouts/workout-session.contracts.ts` | Deferred |
| `completeWorkout` | `workouts/workout-session.contracts.ts` | Deferred |
| `cancelWorkout` | `workouts/workout-session.contracts.ts` | Deferred |
| `getWorkoutSession` | `workouts/workout-session.contracts.ts` | Deferred |
| `listWorkoutSessions` | `workouts/workout-session.contracts.ts` | Deferred |
| `listWorkoutSessionsByDateRange` | `workouts/workout-session.contracts.ts` | Deferred |

### 11. Repository contract (Phase 14)

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `AppointmentRepository` | `appointments/appointment.repository.ts` | Deferred |
| `BodyCompositionRepository` | `body-composition/body-composition.repository.ts` | Deferred |
| `EquipmentRepository` | `equipment/equipment.repository.ts` | Deferred |
| `ExerciseSetRepository` | `exercise-sets/exercise-set.repository.ts` | Deferred |
| `ExerciseRepository` | `exercises/exercise.repository.ts` | Deferred |
| `HydrationEntryRepository` | `hydration/hydration-entry.repository.ts` | Deferred |
| `LaboratoryResultRepository` | `laboratory-results/laboratory-result.repository.ts` | Deferred |
| `HealthMeasurementRepository` | `measurements/health-measurement.repository.ts` | Deferred |
| `MedicationRepository` | `medications/medication.repository.ts` | Deferred |
| `MedicationLogRepository` | `medications/medication.repository.ts` | Deferred |
| `NutritionEntryRepository` | `nutrition/nutrition-entry.repository.ts` | Deferred |
| `PersonalRecordRepository` | `personal-records/personal-record.repository.ts` | Deferred |
| `HealthProfileRepository` | `profiles/health-profile.repository.ts` | Deferred |
| `RecoveryEntryRepository` | `recovery/recovery-entry.repository.ts` | Deferred |
| `HealthRepository` | `repositories/health-repository.contract.ts` | Deferred |
| `ReadRepository` | `repositories/repository.types.ts` | Deferred |
| `WriteRepository` | `repositories/repository.types.ts` | Deferred |
| `CrudRepository` | `repositories/repository.types.ts` | Deferred |
| `ActivityRouteRepository` | `routes/activity-route.repository.ts` | Deferred |
| `RunningActivityRepository` | `running/running-activity.repository.ts` | Deferred |
| `RunningSplitRepository` | `running-splits/running-split.repository.ts` | Deferred |
| `SleepRecordRepository` | `sleep/sleep-record.repository.ts` | Deferred |
| `SymptomEntryRepository` | `symptoms/symptom-entry.repository.ts` | Deferred |
| `VitalReadingRepository` | `vitals/vital-reading.repository.ts` | Deferred |
| `WorkoutPlanRepository` | `workout-plans/workout-plan.repository.ts` | Deferred |
| `WorkoutSessionRepository` | `workouts/workout-session.repository.ts` | Deferred |

### 12. Service/use-case contract (Phase 13)

| Declaration | Original source | Runtime schema / disposition |
| --- | --- | --- |
| `HealthOverview` | `services/health-service.contract.ts` | Deferred |
| `DailyHealthSummary` | `services/health-service.contract.ts` | Deferred |
| `DateRangeSummaryQuery` | `services/health-service.contract.ts` | Deferred |
| `WorkoutSummary` | `services/health-service.contract.ts` | Deferred |
| `UpcomingMedicationReminder` | `services/health-service.contract.ts` | Deferred |
| `UpcomingItemsQuery` | `services/health-service.contract.ts` | Deferred |
| `HealthService` | `services/health-service.contract.ts` | Deferred |

### 13. Integration contract (deferred)

None declared.

## Changed-file inventory

56 modified files; 12 added files; no removed files. All source changes are confined to Health. Build output, caches, logs, temporary inventory scripts, credentials, environment files, and personal Health data are excluded.

| Change | File |
| --- | --- |
| Modified | `README.md` |
| Modified | `docs/DECISIONS.md` |
| Modified | `docs/DEPENDENCIES.md` |
| Modified | `docs/PHASES.md` |
| Modified | `package-lock.json` |
| Modified | `packages/health/package.json` |
| Modified | `packages/health/src/appointments/appointment.contracts.ts` |
| Modified | `packages/health/src/appointments/appointment.types.ts` |
| Modified | `packages/health/src/body-composition/body-composition.contracts.ts` |
| Modified | `packages/health/src/body-composition/body-composition.types.ts` |
| Modified | `packages/health/src/calculations/bmr.contracts.ts` |
| Modified | `packages/health/src/equipment/equipment.contracts.ts` |
| Modified | `packages/health/src/equipment/equipment.types.ts` |
| Modified | `packages/health/src/exercise-sets/exercise-set.contracts.ts` |
| Modified | `packages/health/src/exercise-sets/exercise-set.types.ts` |
| Modified | `packages/health/src/exercises/exercise.contracts.ts` |
| Modified | `packages/health/src/exercises/exercise.types.ts` |
| Modified | `packages/health/src/health-units.types.ts` |
| Modified | `packages/health/src/health.errors.ts` |
| Modified | `packages/health/src/health.types.ts` |
| Modified | `packages/health/src/hydration/hydration-entry.contracts.ts` |
| Modified | `packages/health/src/hydration/hydration-entry.types.ts` |
| Modified | `packages/health/src/index.ts` |
| Modified | `packages/health/src/laboratory-results/laboratory-result.contracts.ts` |
| Modified | `packages/health/src/laboratory-results/laboratory-result.types.ts` |
| Modified | `packages/health/src/measurements/health-measurement.contracts.ts` |
| Modified | `packages/health/src/measurements/health-measurement.types.ts` |
| Modified | `packages/health/src/medications/medication-log.types.ts` |
| Modified | `packages/health/src/medications/medication.contracts.ts` |
| Modified | `packages/health/src/medications/medication.types.ts` |
| Modified | `packages/health/src/nutrition/nutrition-entry.contracts.ts` |
| Modified | `packages/health/src/nutrition/nutrition-entry.types.ts` |
| Modified | `packages/health/src/personal-records/personal-record.contracts.ts` |
| Modified | `packages/health/src/personal-records/personal-record.types.ts` |
| Modified | `packages/health/src/profiles/health-profile.contracts.ts` |
| Modified | `packages/health/src/profiles/health-profile.types.ts` |
| Modified | `packages/health/src/recovery/recovery-entry.contracts.ts` |
| Modified | `packages/health/src/recovery/recovery-entry.types.ts` |
| Modified | `packages/health/src/repositories/repository.types.ts` |
| Modified | `packages/health/src/routes/activity-route.contracts.ts` |
| Modified | `packages/health/src/routes/activity-route.types.ts` |
| Modified | `packages/health/src/running-splits/running-split.contracts.ts` |
| Modified | `packages/health/src/running-splits/running-split.types.ts` |
| Modified | `packages/health/src/running/running-activity.contracts.ts` |
| Modified | `packages/health/src/running/running-activity.types.ts` |
| Modified | `packages/health/src/sleep/sleep-record.contracts.ts` |
| Modified | `packages/health/src/sleep/sleep-record.types.ts` |
| Modified | `packages/health/src/symptoms/symptom-entry.contracts.ts` |
| Modified | `packages/health/src/symptoms/symptom-entry.types.ts` |
| Modified | `packages/health/src/vitals/vital-reading.contracts.ts` |
| Modified | `packages/health/src/vitals/vital-reading.types.ts` |
| Modified | `packages/health/src/workout-plans/workout-plan.contracts.ts` |
| Modified | `packages/health/src/workout-plans/workout-plan.types.ts` |
| Modified | `packages/health/src/workouts/workout-session.contracts.ts` |
| Modified | `packages/health/src/workouts/workout-session.types.ts` |
| Modified | `packages/health/tsconfig.json` |
| Added | `docs/HEALTH_MODELS_VALIDATION.md` |
| Added | `packages/health/README.md` |
| Added | `packages/health/src/contracts.d.ts` |
| Added | `packages/health/src/internal/primitives.ts` |
| Added | `packages/health/src/internal/validation.helpers.ts` |
| Added | `packages/health/test/health-invariants.test.ts` |
| Added | `packages/health/test/health-models.test.ts` |
| Added | `packages/health/test/health-primitives.test.ts` |
| Added | `packages/health/test/model-fixtures.ts` |
| Added | `packages/health/test/primitive-fixtures.ts` |
| Added | `packages/health/test/public-import.test.ts` |
| Added | `packages/health/tsconfig.build.json` |
