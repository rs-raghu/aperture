# Phase 5 Education models and validation

Phase 5 implemented runtime-safe Education data shapes and validation. Phase 6 now consumes that boundary for seven academic calculations; Education operations, repositories, services, applications, APIs, authentication, and persistence remain unimplemented.

## Implemented entity schema families

Each principal entity has a strict stored-entity schema plus create, update, and query schemas.

| Entity | Stored schema | Create schema | Update schema | Query schema |
| --- | --- | --- | --- | --- |
| Institution | `institutionSchema` | `createInstitutionInputSchema` | `updateInstitutionInputSchema` | `institutionQuerySchema` |
| Academic program | `academicProgramSchema` | `createProgramInputSchema` | `updateProgramInputSchema` | `programQuerySchema` |
| Semester | `semesterSchema` | `createSemesterInputSchema` | `updateSemesterInputSchema` | `semesterQuerySchema` |
| Course | `courseSchema` | `createCourseInputSchema` | `updateCourseInputSchema` | `courseQuerySchema` |
| Topic | `courseTopicSchema` | `createTopicInputSchema` | `updateTopicInputSchema` | `topicQuerySchema` |
| Assignment | `assignmentSchema` | `createAssignmentInputSchema` | `updateAssignmentInputSchema` | `assignmentQuerySchema` |
| Exam | `examSchema` | `createExamInputSchema` | `updateExamInputSchema` | `examQuerySchema` |
| Grade | `gradeSchema` | `createGradeInputSchema` | `updateGradeInputSchema` | `gradeQuerySchema` |
| Attendance record | `attendanceRecordSchema` | `createAttendanceInputSchema` | `updateAttendanceInputSchema` | `attendanceQuerySchema` |
| Study session | `studySessionSchema` | `createStudySessionInputSchema` | `updateStudySessionInputSchema` | `studySessionQuerySchema` |
| Schedule entry | `scheduleEntrySchema` | `createScheduleEntryInputSchema` | `updateScheduleEntryInputSchema` | `scheduleEntryQuerySchema` |
| Learning resource | `learningResourceSchema` | `createLearningResourceInputSchema` | `updateLearningResourceInputSchema` | `learningResourceQuerySchema` |
| Certificate | `certificateSchema` | `createCertificateInputSchema` | `updateCertificateInputSchema` | `certificateQuerySchema` |
| Education goal | `educationGoalSchema` | `createEducationGoalInputSchema` | `updateEducationGoalInputSchema` | `educationGoalQuerySchema` |

Legacy input/query type names remain as aliases where needed by Phase 1 contracts. Types are inferred from schemas wherever practical.

## Schema conventions

- Stored entities require a UUID entity ID, UUID owner ID, creation timestamp, and update timestamp.
- Create schemas require an owner ID and exclude stored metadata.
- Update schemas require the target entity ID, omit owner reassignment, allow only mutable fields, reject unknown properties, and require at least one supplied mutation.
- Query schemas require an owner ID, reject unknown properties, and use bounded pagination.
- Titles are trimmed, non-empty, and limited to 200 characters. Descriptions are limited to 4,000 characters and notes to 8,000.
- Optional and nullable are distinct. Phase 5 does not silently translate null values into omission.
- Parsing returns plain serialization-safe strings, numbers, arrays, and objects. Domain dates are never converted into `Date` objects.

## Identifier convention

All Education and owner identifiers use RFC 4122-compatible UUID strings. IDs remain strings at domain boundaries and are never converted to numbers. Phase 5 validates identifier shape only; it does not check existence, ownership, or foreign-key consistency.

## Date and timestamp convention

- Date-only values use `YYYY-MM-DD` and must be real calendar dates.
- Timestamps use RFC 3339/ISO 8601 date-times with `Z` or an explicit numeric timezone offset.
- Locale-formatted dates, impossible calendar dates, and timezone-free timestamps are rejected.
- Semester, institution, course, exam, schedule, study-session, certificate, program, and goal schemas apply only structural start/end ordering checks where both values are available.

## Decimal-string convention

`decimalStringSchema` accepts normalized plain decimal strings without scientific notation, commas, symbols, `NaN`, or `Infinity`. Scores, credits, grade points, percentages, and goal values use non-negative decimal strings. Phase 6 calculator-specific schemas reuse this convention and perform arithmetic exclusively with `decimal.js`.

## Relationships

```text
Institution
└── Academic Program
    └── Semester
        └── Course
            ├── Topic
            ├── Assignment
            ├── Exam
            ├── Grade
            ├── Attendance Record
            ├── Study Session
            └── Learning Resource
```

Schedule entries may optionally reference a course. Certificates may stand alone or reference academic entities. Education goals may stand alone or reference one program, semester, or course. Grades structurally enforce a single assignment-or-exam source relationship. Validation does not load or verify related records.

## Shared validation boundary

`@aperture/validation` implements five helpers: `validateInput`, `validateOutput`, `normalizeValidationError`, `isValidationSuccess`, and `isValidationFailure`. It accepts a narrow Zod schema type, preserves issue paths and readable messages, and does not expose stack traces through normalized errors.

The dependency direction is Education → Validation → Zod. Validation does not depend on Education or an application framework.

## Public entry points and build boundary

- `@aperture/education` and `@aperture/education/models` expose runtime schemas, inferred entity/input/query types, primitives, and Education error shapes.
- `@aperture/education/contracts` is a types-only entry for repository, service, operation-input, and calculation contract types.
- Ambient operation declarations remain source-only and are not re-exported as runtime values.
- The Education production build includes model, error, and calculator modules. It excludes tests and ambient operation, repository, and service modules.

## Validation errors

Education exposes codes for invalid input, unsupported status, invalid date ranges, invalid decimal representations, missing relationships, conflicting relationships, and unknown validation failures. These structures contain no HTTP status, logging, database, or UI behavior.

## Tests

Synthetic tests cover all 14 entities: valid stored/create/update/query values; required fields; owner and related UUIDs; timestamps; strict unknown-field handling; non-empty updates; and owner reassignment rejection. Targeted tests cover calendar dates, timezone offsets, decimals, negative values, ordering, statuses, text bounds, URLs, and conflicting relationships. Shared Validation tests cover result narrowing, paths, messages, output validation, and safe error normalization.

## What remains declaration-only after Phase 6

All 79 CRUD-style Education operation declarations, all 15 repository interfaces, and the Education service interface remain unimplemented. The seven calculations are documented separately in `EDUCATION_CALCULATIONS.md`.

## Phase 5 exclusions

Phase 5 itself added no calculations. Phase 6 is limited to calculators and adds no repository, service, API, database, Supabase client, authentication, UI, web page, mobile screen, import/export, notification, synchronization, mock application data, or seed data. Phase 7 has not started.
