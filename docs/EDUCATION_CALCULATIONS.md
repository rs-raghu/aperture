# Phase 6 Education calculations

Phase 6 implements seven deterministic Education calculations. Every academic quantity enters and leaves as a normalized decimal string. Arithmetic uses `decimal.js`; inputs are validated through `@aperture/validation` before calculation. Institutional policies vary, so callers must select the applicable scale and explicit policies.

## Shared precision and error rules

- The default rounding policy is two decimal places with half-up rounding. Callers may select `half-up`, `half-even`, `down`, or `up` and zero through twelve decimal places.
- Exact outputs are normalized, unrounded decimal strings at the configured Decimal precision. Display outputs are rounded once at the end; intermediate results are not rounded.
- Decimal inputs reject negatives where meaningless, exponent notation, commas, symbols, empty strings, `NaN`, and `Infinity`.
- Invalid inputs throw `EducationCalculationError` with stable codes, readable messages, and field paths. Decimal-library errors are not exposed.
- Inputs are never mutated. Calculators do not read clocks, environment, storage, locale, preferences, or networks.

## `calculateGpa`

Purpose: credit-weighted GPA. Formula: `sum(grade points × credits) / sum(included credits)`.

- Inputs: course UUID, credits, grade points, inclusion flag, maximum grade-point scale, zero-credit policy, and rounding.
- Outputs: included/excluded counts, credits, quality points, exact/rounded GPA, scale, and rounding metadata.
- Zero-credit courses default to rejection and may be explicitly excluded. Excluded courses do not enter either sum. An empty effective set or zero denominator is rejected.
- Grade points must not exceed the selected scale; no letter-grade conversion is inferred.
- Example: 4 points × 4 credits and 3 points × 2 credits produces 22 quality points over 6 credits, exactly `3.6666666666666666667`, displayed as `3.67`.

## `calculateCgpa`

Purpose: credit-weighted aggregation of semester GPAs. Formula: `sum(semester GPA × semester credits) / sum(included semester credits)`.

- Inputs: semester UUID, GPA, credits, inclusion flag, scale, and rounding.
- Outputs: included/excluded counts, credits, weighted grade points, exact/rounded CGPA, scale, and rounding metadata.
- Excluded semesters do not enter the formula. Empty effective input, a zero denominator, and GPA above scale are rejected.
- Example: GPA 4 over 20 credits and GPA 3 over 10 credits produces `110 / 30 = 3.6666666666666666667`, displayed as `3.67`.

## `calculateWeightedGrade`

Purpose: aggregate assessment contributions. Each contribution is `(score earned / maximum score) × weight percentage`.

- Inputs: component identifier, score, maximum, weight, inclusion, explicit extra-credit and overweight permissions, and rounding.
- Outputs: component counts, total weight, weighted points, normalized current grade, full-course contribution, warnings, and rounding metadata.
- The normalized current grade divides earned weighted points by represented weight; full-course contribution does not. A score of 80% over 40% weight is therefore current grade `80` and course contribution `32`.
- Non-positive maximums, negative values, zero effective weight, and weight above 100 are rejected unless the relevant policy explicitly permits the case. Extra credit is rejected by default.

## `projectCourseGrade`

Purpose: project a final percentage without altering recorded grades.

- Inputs: completed weighted components, remaining component weights, per-component or shared expected percentages, missing-expectation policy, and rounding.
- Outputs: completed/remaining weight, earned and expected contributions, projected/best/lowest percentages, unresolved weight, assumptions, warnings, and rounding metadata.
- Component identifiers cannot overlap and total represented weight cannot exceed 100. Missing expectations reject by default; explicit exclusion reports unresolved weight rather than assuming zero.
- Best case assumes 100% on all remaining represented weight; lowest case assumes no further contribution.
- Example: 32 weighted points earned over 40% plus an expected 90% on the remaining 60% produces `32 + 54 = 86`; best is `92`, lowest is `32`.

## `calculateRequiredScore`

Purpose: determine the assessment percentage and raw score needed to reach a target. Formula when needed: `(target − weighted points earned) / remaining weight × 100`.

- Inputs: earned weighted points, completed weight, remaining assessment weight and maximum score, target, extra-credit policy, and rounding.
- Outputs: exact/rounded required percentage and raw score, feasibility, already-achieved flag, explanation code, maximum score, and rounding metadata.
- A zero remaining weight is rejected when a score is still required. Required results above 100 are never capped or presented as achievable.
- Feasibility is `already-achieved`, `achievable`, `requires-extra-credit`, `impossible`, or `insufficient-remaining-weight`.
- Example: 60 points already earned, 25% remaining, and target 80 requires 80% on the assessment; with a maximum of 50, the raw score is 40.

## `calculateAttendancePercentage`

Purpose: count-based attendance. Formula: `attended eligible sessions / eligible sessions × 100`.

- Present and late are eligible and attended. Absent is eligible and not attended. Cancelled is excluded.
- The caller must set excused policy to `include-as-attended`, `include-as-absent`, or `exclude`; there is no silent default.
- Outputs include every status count, denominator, attended count, exact/rounded percentage, policy, and rounding metadata.
- An empty effective denominator is rejected. Duration-based attendance is not mixed into this count-based calculator.
- Example: one present, one absent, and one cancelled record produces `1 / 2 × 100 = 50`.

## `calculateDegreeProgress`

Purpose: completed-credit progress. Formula: `applicable completed credits / required credits × 100`.

- Inputs: required, completed, in-progress, and transferred credits; explicit transfer-credit policy; and rounding.
- In-progress credits are reported but never counted as completed. Transfer credits count only when explicitly enabled.
- Outputs include applicable, remaining, and excess credits, exact/rounded progress, separately capped display progress, completion status, policy, and rounding metadata.
- Required credits must be positive; all other credits must be non-negative. Raw progress may exceed 100, remaining credits never become negative, and excess credits are separate.
- Example: 130 applicable credits against 120 required produces exact progress `108.33333333333333333`, display-capped to `100.00`, with 10 excess credits.

## Boundaries and limitations

These functions are neutral calculators, not institutional policy engines. They do not select a GPA scale, convert letters, decide attendance eligibility beyond the supplied policy, persist results, verify course relationships, or provide recommendations. Repository, service, CRUD, UI, API, authentication, and database behavior remain unimplemented. Phase 7 has not started.
