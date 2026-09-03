# Education package inventory through Phase 6

The Phase 1 structure remains. Phase 5 implemented models and validation; Phase 6 implements exactly seven academic calculations. See [Education calculations](EDUCATION_CALCULATIONS.md).

## Package organization

| Location | Purpose | Runtime status |
| --- | --- | --- |
| `src/education.types.ts` | UUID, ISO date/time, text, decimal, percentage, credit, grade-scale, status, pagination, and metadata schemas. | Implemented |
| `src/education.errors.ts` | Education validation error codes and strict error schemas. | Implemented |
| Fourteen `*.types.ts` entity modules | Strict stored/create/update/query schemas and inferred types. | Implemented |
| `src/models.ts` and `src/index.ts` | Runtime-safe model exports. | Implemented |
| `src/contracts.d.ts` | Types-only contract entry point. | Declaration only |
| Fourteen `*.contracts.ts` modules | Existing named operation declarations and contract types. | Declaration only |
| Fourteen `*.repository.ts` modules and aggregate repository | Storage-neutral repository interfaces. | Declaration only |
| `src/services/education-service.contract.ts` | Education orchestration interface. | Declaration only |
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

The 79 non-calculation Education operation declarations are retained without bodies. Fifteen repository interfaces and the Education service interface remain unimplemented. The seven calculation declarations have been replaced by runtime implementations and are available from the default and `/calculations` entries.

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

## Phase 6 checklist

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
- [x] Repository, service, and CRUD-style operation declarations remain without implementations.
- [x] No UI, API, authentication, database, or Supabase implementation.
- [x] Phase 7 not started.
