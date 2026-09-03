# Education package inventory through Phase 8

The Phase 1 structure remains. Phase 5 implemented models and validation, Phase 6 implemented seven academic calculations, Phase 7 implements the dependency-injected application layer, and Phase 8 implements its separate volatile memory adapter. See [Education services](EDUCATION_SERVICES.md) and [Education memory repository](EDUCATION_MEMORY_REPOSITORY.md).

## Package organization

| Location | Purpose | Runtime status |
| --- | --- | --- |
| `src/education.types.ts` | UUID, ISO date/time, text, decimal, percentage, credit, grade-scale, status, pagination, and metadata schemas. | Implemented |
| `src/education.errors.ts` | Education validation error codes and strict error schemas. | Implemented |
| Fourteen `*.types.ts` entity modules | Strict stored/create/update/query schemas and inferred types. | Implemented |
| `src/models.ts` and `src/index.ts` | Runtime-safe model exports. | Implemented |
| `src/contracts.d.ts` | Types-only contract entry point. | Declaration only |
| Fourteen `*.contracts.ts` modules | Type-only compatibility exports; ghost callable declarations were removed. | Type only |
| Fourteen `*.repository.ts` modules and aggregate repository | Storage-neutral repository interfaces consumed through dependency injection. | Interfaces implemented externally by `@aperture/education-memory` |
| `src/application/` and `src/services/` | Seventy-nine workflows, six summaries, errors, dependency contracts, and service factory. | Implemented |
| Seven `src/calculations/*.contracts.ts` modules | Validated decimal-safe calculator schemas, results, and functions. | Implemented |
| `src/calculations.ts` and shared calculation modules | Runtime exports, rounding policy, decimal schemas/helpers, and typed errors. | Implemented |
| `test/education-models.test.ts` | Synthetic schema conformance and boundary tests. | Test only |

## Entity inventory

1. Institution
2. Academic program
3. Semester
4. Course
5. Course topic
6. Assignment
7. Exam
8. Grade
9. Attendance record
10. Study session
11. Schedule entry
12. Learning resource
13. Certificate
14. Education goal

Every entity has a strict stored schema, create schema, update schema, and query schema. Stored types are inferred from their schemas.

## Declaration inventory retained

All 79 former non-calculation operation names are real methods on the injected Education service. The ambient callable declarations were removed. The fourteen entity repositories and aggregate interface have a process-local implementation in `@aperture/education-memory`; the Education package remains storage-neutral. The seven calculations remain available from the default and `/calculations` entries.

## Relationship inventory

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

Schedule entries can reference a course. Certificates can stand alone or reference academic entities. Education goals can stand alone or reference one program, semester, or course. Identifier validation does not prove that a relationship exists or belongs to the same owner.

## Phase 8 checklist

- [x] Fourteen stored-entity schemas.
- [x] Fourteen create-input schemas.
- [x] Fourteen update-input schemas requiring a target and at least one mutation.
- [x] Fourteen query schemas.
- [x] UUID owner/entity identifiers.
- [x] Calendar-valid date-only strings.
- [x] Explicit-timezone RFC 3339 timestamps.
- [x] Normalized decimal-string primitives.
- [x] Strict unknown-field rejection.
- [x] Runtime-safe model exports.
- [x] Shared Validation helpers and readable errors.
- [x] Synthetic model and validation tests.
- [x] Seven calculation functions use validated decimal strings and `decimal.js` arithmetic.
- [x] Exact and rounded results expose explicit rounding metadata.
- [x] Seventy-nine owner-scoped workflows and six high-level summaries are implemented.
- [x] Repository, clock, and ID-generator dependencies are injected.
- [x] Repository contracts remain storage-independent interfaces.
- [x] All fourteen repository interfaces have a separate memory implementation.
- [x] Aggregate factories own isolated, unseeded stores.
- [x] Owner scoping, CRUD, filters, stable sorting, and cursor pagination are implemented.
- [x] Stored and returned values are defensively cloned by default.
- [x] Deterministic fixtures remain test-only.
- [x] Phase 7 services pass integration tests against the real adapter.
- [x] No UI, API, authentication, database, or Supabase implementation.
- [x] Phase 9 not started.
