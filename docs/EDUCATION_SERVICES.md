# Phase 7 Education services and use cases

Phase 7 implements the Education application layer through `createEducationService`. Phase 8 adds the optional, volatile `@aperture/education-memory` adapter; callers still inject repositories together with a clock and ID generator.

## Application structure

| Location | Responsibility |
| --- | --- |
| `src/application/application.types.ts` | Owner-scoped operation context and owner-free payload types. |
| `src/application/application.errors.ts` | Stable, framework-independent application errors. |
| `src/application/clock.contract.ts` | Injected timestamp source. |
| `src/application/dependencies.ts` | Repository, clock, and ID-generator dependency contract. |
| `src/application/application.helpers.ts` | Shared validation, ownership, immutable entity construction, transition, and ordering helpers. |
| `src/application/use-cases/academic-structure.ts` | Institution, program, semester, course, and topic workflows. |
| `src/application/use-cases/assessments.ts` | Assignment, exam, grade, and attendance workflows. |
| `src/application/use-cases/planning.ts` | Study session, schedule, resource, certificate, and goal workflows. |
| `src/services/summaries/education-summaries.ts` | Six owner-scoped aggregate summaries. |
| `src/services/education-service.ts` | Dependency-injected service factory. |

The default and `/application` package entries expose the real factory and type-only dependency/repository contracts. The former ambient operation declarations were removed, so an unavailable standalone operation cannot be imported accidentally.

## Dependency injection and owner context

`EducationServiceDependencies` contains `repositories`, `clock`, and `idGenerator`. Business workflows never read global time, generate random IDs, read environment variables, or hold mutable module state.

Every method receives `EducationOperationContext` with the authenticated-owner placeholder. Create payloads cannot contain `ownerId`; the context owner is applied after validation. Updates preserve ID, owner, and creation timestamp. Repository reads and queries always receive the context owner. A missing cross-owner record is hidden as not found; a repository that unexpectedly returns another owner's record causes `education-owner-mismatch`.

## Implemented workflow inventory

| Group | Count | Operations |
| --- | ---: | --- |
| Institutions | 5 | create, update, archive, get, list |
| Programs | 5 | create, update, archive, get, list |
| Semesters | 6 | create, update, activate, complete, get, list |
| Courses | 6 | create, update, archive, get, list, list by semester |
| Topics | 5 | create, update, complete, get, list by course |
| Assignments | 7 | create, update, submit, complete, get, list, upcoming |
| Exams | 6 | create, update, complete, get, list, upcoming |
| Grades | 6 | record, update, hard delete, get, list by course, list by semester |
| Attendance | 5 | record, update, hard delete, list by course, summary |
| Study sessions | 7 | schedule, start, complete, cancel, get, list, list by course |
| Schedule entries | 5 | create, update, hard delete, get, list |
| Learning resources | 5 | create, update, archive, get, list by course |
| Certificates | 5 | create, update, hard delete, get, list |
| Education goals | 6 | create, update, complete, archive, get, list |

Total: 79 workflow methods plus six high-level summary methods.

## State transitions

| Entity | Allowed transitions | Repeated terminal request |
| --- | --- | --- |
| Institution | non-archived → archived through `archiveInstitution` | Archive is idempotent. |
| Program | non-archived → archived through `archiveProgram` | Archive is idempotent. |
| Semester | planned → active → completed | Activate and complete are idempotent only when already in their requested state; completed cannot reopen. |
| Course | non-archived → archived through `archiveCourse` | Archive is idempotent. |
| Topic | planned/in-progress → completed | Completion is idempotent and records `completedAt`. |
| Assignment | draft → assigned; draft/assigned → cancelled; assigned → submitted → completed | Submit and complete are idempotent in their matching state. Terminal records cannot be edited. |
| Exam | scheduled → completed or cancelled | Completion is idempotent. Completed/cancelled exams cannot be edited. |
| Study session | scheduled → in-progress → completed; scheduled/in-progress/paused → cancelled | Completion/cancellation is idempotent; completed sessions cannot restart. |
| Resource | active/completed → archived | Archive is idempotent. |
| Education goal | planned/active → completed; planned/active/completed → archived | Complete/archive are idempotent in their matching state; archived goals cannot complete. |

Lifecycle transitions use the injected clock through entity `updatedAt`; topic/goal completion and study/assignment timing fields use it where their models provide dedicated fields. The current Assignment and Exam models do not contain separate completion timestamps.

## Parent and conflict rules

- Programs require an owner-scoped institution.
- Semesters require a program. Only one active semester per program is allowed.
- Courses require a semester. Course codes are case-sensitive and unique within a semester when supplied.
- Topics require a course. A parent topic must belong to the same course and cannot be the topic itself.
- Assignments, exams, grades, attendance, study sessions, schedules, and resources validate their referenced course. Topic references must match that course.
- An Exam semester must match its Course semester.
- Assignment- and Exam-sourced grades validate the source belongs to the same course. Only one grade per referenced assessment is allowed; manual grades are not subject to this duplicate rule.
- Attendance is unique by owner, course, and session date.
- Certificate and goal references are owner-scoped. Phase 5 continues to enforce the single-scope goal rule.
- Institution archival is blocked by active programs. Program archival is blocked by an active semester. Course/resource archival retains related records and performs no cascade.

## Archive and hard-delete behavior

Archives are state transitions and retain related data. Repeated archive requests return the existing archived entity. Grade, attendance, schedule-entry, and certificate deletion are explicit owner-scoped hard deletes. They are non-idempotent: deleting an absent record returns `education-record-not-found`. No operation silently cascades.

## Summary definitions

- Education overview reports the single active semester/program, active-course count, and future eligible assignment/exam counts. Multiple active semesters are an explicit conflict.
- Upcoming deadlines combines eligible assignments, exams, and assignment/exam schedule entries within an explicit timestamp window, ordered by timestamp then ID.
- Current semester summary returns one active semester and deterministically ordered courses. No active semester returns `null`; multiple matches are a conflict.
- Course progress reports separate topic and non-cancelled-assignment completion dimensions. Each percentage is completed count divided by its own count; an empty dimension omits its percentage.
- Study-time summary includes completed sessions with stored `actualDurationMinutes`; completed sessions missing a duration are counted as omitted rather than inferred.
- Academic performance uses Phase 6 `calculateWeightedGrade`, `calculateGpa`, and `calculateCgpa`. The latest timestamped grade-point record per course is used when the course has credits. Missing grade-point courses are explicit. The caller supplies one GPA scale for the summary.
- Course attendance delegates to Phase 6 `calculateAttendancePercentage` and requires an explicit excused-attendance policy.

## Application errors

`EducationApplicationError` exposes these stable codes: `education-record-not-found`, `education-parent-not-found`, `education-owner-mismatch`, `education-invalid-state-transition`, `education-conflict`, `education-related-records-exist`, `education-validation-failed`, and `education-operation-failed`. Errors contain safe messages, optional entity type/ID, and validation issues without HTTP or database details.

## Repository-interface changes

- Generic repositories now accept complete immutable entities in `create` and `update`; ID, owner, and timestamps are therefore application-layer decisions.
- Repository-specific lifecycle methods were removed; state transitions belong to use cases.
- `CourseRepository.findByCode` supports semester-scoped uniqueness.
- `GradeRepository.findManyBySemester` supports academic summaries and semester listing.
- `GradeRepository.findForGradeable` supports duplicate-assessment detection.
- `AttendanceRepository.findByCourseAndSessionDate` supports duplicate-session detection.
- Grade and Attendance repositories accept their general owner-scoped query shapes so all approved lists and summaries remain storage-neutral.

## Limitations after Phase 8

The Education domain package still selects no adapter. The memory implementation is non-durable and intended for tests and future application development, not production persistence. There is no database, SQL, Supabase adapter, API, authentication, UI, navigation, synchronization, import/export, file access, notification, background job, or recommendation behavior. Web and mobile remain non-runnable. Phase 9 has not started.
