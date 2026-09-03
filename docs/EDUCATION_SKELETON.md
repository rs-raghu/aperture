# Education package inventory through Phase 5

The Phase 1 Education structure remains, while Phase 5 implements its model and validation boundary. See [Education models and validation](EDUCATION_MODELS_AND_VALIDATION.md) for the complete schema catalog and rules.

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
| Seven `src/calculations/*.contracts.ts` modules | Calculation input/result types and function declarations. | Declaration only |
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

The 86 named Education operation declarations are retained without bodies. This includes all Phase 1 CRUD-style declarations and the 7 calculation declarations. Fifteen repository interfaces and the Education service interface remain unimplemented. The types-only `@aperture/education/contracts` entry prevents ambient functions from appearing as callable runtime exports.

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

## Phase 5 checklist

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
- [x] Repository, service, operation, and calculation declarations remain without implementations.
- [x] No UI, API, authentication, database, or Supabase implementation.
- [x] Phase 6 not started.
