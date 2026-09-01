# Education domain skeleton inventory

This document inventories the complete Phase 1 structural surface. Source modules define only types, interfaces, and `declare` function signatures; the package index contains explicit re-exports of that surface.

## Workspace folders and root files

- `packages/` contains workspace packages; Phase 1 creates only `packages/education/`.
- `docs/` contains the phase plan, this inventory, and architectural decisions.
- `package.json` defines the private npm workspace, the root `typecheck` script, and the two approved development dependencies.
- `package-lock.json` records the reproducible npm dependency graph.
- `tsconfig.base.json` supplies the shared strict, no-emit TypeScript configuration.
- `.gitignore` excludes dependencies, generated output, environment files, logs, backups, dumps, databases, and editor or operating-system artifacts.
- `README.md` identifies the incremental, non-functional Phase 1 boundary and data-safety notice.

## Education package files

| Folder | File | Public structural purpose |
|---|---|---|
| `packages/education/` | `package.json` | Private workspace package metadata, type-only package entry, and package typecheck command. |
| `packages/education/` | `tsconfig.json` | Education compiler boundary extending the root configuration. |
| `src/` | `index.ts` | Explicit export list for the complete supported package surface. |
| `src/` | `education.types.ts` | Owner, ISO boundary, metadata, paging, sorting, range, and shared status types. |
| `src/` | `education.errors.ts` | Structural Education error code and error shape. |
| `src/institutions/` | `institution.types.ts` | `InstitutionId`, status, and entity. |
| `src/institutions/` | `institution.contracts.ts` | Institution command/query inputs and declared operations. |
| `src/institutions/` | `institution.repository.ts` | Institution repository interface. |
| `src/programs/` | `program.types.ts` | `ProgramId`, status, and `AcademicProgram`. |
| `src/programs/` | `program.contracts.ts` | Program command/query inputs and declared operations. |
| `src/programs/` | `program.repository.ts` | Program repository interface. |
| `src/semesters/` | `semester.types.ts` | `SemesterId`, status, and entity. |
| `src/semesters/` | `semester.contracts.ts` | Semester command/query inputs and declared operations. |
| `src/semesters/` | `semester.repository.ts` | Semester repository interface. |
| `src/courses/` | `course.types.ts` | `CourseId`, status, and entity. |
| `src/courses/` | `course.contracts.ts` | Course command/query inputs and declared operations. |
| `src/courses/` | `course.repository.ts` | Course repository interface. |
| `src/topics/` | `topic.types.ts` | `TopicId`, status, and `CourseTopic`. |
| `src/topics/` | `topic.contracts.ts` | Topic command/query inputs and declared operations. |
| `src/topics/` | `topic.repository.ts` | Topic repository interface. |
| `src/assignments/` | `assignment.types.ts` | `AssignmentId`, status, and entity. |
| `src/assignments/` | `assignment.contracts.ts` | Assignment command/query inputs and declared operations. |
| `src/assignments/` | `assignment.repository.ts` | Assignment repository interface. |
| `src/exams/` | `exam.types.ts` | `ExamId`, status, and entity. |
| `src/exams/` | `exam.contracts.ts` | Exam command/query inputs and declared operations. |
| `src/exams/` | `exam.repository.ts` | Exam repository interface. |
| `src/grades/` | `grade.types.ts` | `GradeId` and entity. |
| `src/grades/` | `grade.contracts.ts` | Grade command/query inputs and declared operations. |
| `src/grades/` | `grade.repository.ts` | Grade repository interface. |
| `src/attendance/` | `attendance.types.ts` | `AttendanceRecordId`, status, and entity. |
| `src/attendance/` | `attendance.contracts.ts` | Attendance inputs, queries, summary shape, and declared operations. |
| `src/attendance/` | `attendance.repository.ts` | Attendance repository interface. |
| `src/study-sessions/` | `study-session.types.ts` | `StudySessionId`, status, and entity. |
| `src/study-sessions/` | `study-session.contracts.ts` | Study-session inputs, queries, and declared operations. |
| `src/study-sessions/` | `study-session.repository.ts` | Study-session repository interface. |
| `src/schedules/` | `schedule.types.ts` | `ScheduleEntryId`, status, and entity. |
| `src/schedules/` | `schedule.contracts.ts` | Schedule command/query inputs and declared operations. |
| `src/schedules/` | `schedule.repository.ts` | Schedule repository interface. |
| `src/resources/` | `resource.types.ts` | `ResourceId`, kind, status, and `LearningResource`. |
| `src/resources/` | `resource.contracts.ts` | Resource command/query inputs and declared operations. |
| `src/resources/` | `resource.repository.ts` | Resource repository interface. |
| `src/certificates/` | `certificate.types.ts` | `CertificateId`, status, and entity. |
| `src/certificates/` | `certificate.contracts.ts` | Certificate command/query inputs and declared operations. |
| `src/certificates/` | `certificate.repository.ts` | Certificate repository interface. |
| `src/goals/` | `education-goal.types.ts` | `EducationGoalId`, status, and entity. |
| `src/goals/` | `education-goal.contracts.ts` | Goal command/query inputs and declared operations. |
| `src/goals/` | `education-goal.repository.ts` | Education-goal repository interface. |
| `src/calculations/` | `gpa.contracts.ts` | GPA input/result types and declaration. |
| `src/calculations/` | `cgpa.contracts.ts` | CGPA input/result types and declaration. |
| `src/calculations/` | `weighted-grade.contracts.ts` | Weighted-grade input/result types and declaration. |
| `src/calculations/` | `grade-projection.contracts.ts` | Course-grade projection input/result types and declaration. |
| `src/calculations/` | `required-score.contracts.ts` | Required-score input/result types and declaration. |
| `src/calculations/` | `attendance-percentage.contracts.ts` | Attendance-percentage input/result types and declaration. |
| `src/calculations/` | `degree-progress.contracts.ts` | Degree-progress input/result types and declaration. |
| `src/repositories/` | `repository.types.ts` | Generic read, write, CRUD, and filter interfaces. |
| `src/repositories/` | `education-repository.contract.ts` | Aggregate `EducationRepository` with readonly domain repositories. |
| `src/services/` | `education-service.contract.ts` | Orchestration interface and summary/query shapes. |

No additional source folder exists outside this inventory.

## Principal entities and relationships

All entities carry an ID, owner placeholder, creation timestamp, and update timestamp. Boundary dates and date-times are ISO string aliases.

| Entity | Identifier | Main relationships |
|---|---|---|
| Institution | `InstitutionId` | Owns academic programs. |
| Academic program | `ProgramId` | Belongs to an institution; owns semesters and may own education goals or certificates. |
| Semester | `SemesterId` | Belongs to a program; groups courses. |
| Course | `CourseId` | Belongs to a semester; owns topics, assignments, exams, grades, attendance, study sessions, schedule entries, and resources. |
| Course topic | `TopicId` | Belongs to a course. |
| Assignment | `AssignmentId` | Belongs to a course and may reference a topic. |
| Exam | `ExamId` | Belongs to a course. |
| Grade | `GradeId` | Belongs to a course and semester and may reference an assignment or exam. |
| Attendance record | `AttendanceRecordId` | Belongs to a course. |
| Study session | `StudySessionId` | Belongs to a course and may reference a topic. |
| Schedule entry | `ScheduleEntryId` | May reference a course. |
| Learning resource | `ResourceId` | Belongs to a course and may reference a topic. |
| Certificate | `CertificateId` | May reference an institution, program, or course. |
| Education goal | `EducationGoalId` | May reference a program, semester, or course. |

`OwnerId` remains an opaque placeholder. Phase 1 does not define users or authentication.

## Declared domain functions

| Contract | Declared functions |
|---|---|
| Institution | `createInstitution`, `updateInstitution`, `archiveInstitution`, `getInstitution`, `listInstitutions` |
| Program | `createProgram`, `updateProgram`, `archiveProgram`, `getProgram`, `listPrograms` |
| Semester | `createSemester`, `updateSemester`, `activateSemester`, `completeSemester`, `getSemester`, `listSemesters` |
| Course | `createCourse`, `updateCourse`, `archiveCourse`, `getCourse`, `listCourses`, `listCoursesBySemester` |
| Topic | `createTopic`, `updateTopic`, `markTopicComplete`, `getTopic`, `listTopicsByCourse` |
| Assignment | `createAssignment`, `updateAssignment`, `submitAssignment`, `markAssignmentComplete`, `getAssignment`, `listAssignments`, `getUpcomingAssignments` |
| Exam | `createExam`, `updateExam`, `completeExam`, `getExam`, `listExams`, `getUpcomingExams` |
| Grade | `recordGrade`, `updateGrade`, `deleteGrade`, `getGrade`, `listGradesByCourse`, `listGradesBySemester` |
| Attendance | `recordAttendance`, `updateAttendance`, `deleteAttendance`, `listAttendanceByCourse`, `getCourseAttendanceSummary` |
| Study session | `scheduleStudySession`, `startStudySession`, `completeStudySession`, `cancelStudySession`, `getStudySession`, `listStudySessions`, `listStudySessionsByCourse` |
| Schedule | `createScheduleEntry`, `updateScheduleEntry`, `deleteScheduleEntry`, `getScheduleEntry`, `listScheduleEntries` |
| Resource | `createResource`, `updateResource`, `archiveResource`, `getResource`, `listResourcesByCourse` |
| Certificate | `createCertificate`, `updateCertificate`, `deleteCertificate`, `getCertificate`, `listCertificates` |
| Education goal | `createEducationGoal`, `updateEducationGoal`, `completeEducationGoal`, `archiveEducationGoal`, `getEducationGoal`, `listEducationGoals` |
| Calculation | `calculateGpa`, `calculateCgpa`, `calculateWeightedGrade`, `projectCourseGrade`, `calculateRequiredScore`, `calculateAttendancePercentage`, `calculateDegreeProgress` |

Each name above is an ambient `export declare function` with typed inputs and results; none has an implementation body.

## Repository and service contracts

`ReadRepository`, `WriteRepository`, and `CrudRepository` describe generic `findById`, `findMany`, `create`, `update`, and `delete` operations. The fourteen domain repository interfaces specialize those shapes and add domain-specific query signatures where needed. `EducationRepository` exposes all fourteen repositories through readonly properties and supplies no implementation.

`EducationService` declares future orchestration for `getEducationOverview`, `getUpcomingDeadlines`, `getCurrentSemesterSummary`, `getCourseProgress`, `getStudyTimeSummary`, and `getAcademicPerformanceSummary`. Its output interfaces describe summaries only; no summary is calculated in Phase 1.

## Declaration checklist

- [x] All fourteen required identifier aliases and entity interfaces exist.
- [x] Institution, program, semester, course, topic, assignment, exam, grade, attendance, study-session, schedule, resource, certificate, and education-goal declarations exist.
- [x] All 79 required entity command/query functions exist.
- [x] All seven required calculation functions have documented input/result units and no formulas.
- [x] Generic repositories contain `findById`, `findMany`, `create`, `update`, and `delete` signatures.
- [x] Fourteen domain repository interfaces and the readonly aggregate repository exist.
- [x] The Education service covers all six required orchestration summaries.
- [x] `src/index.ts` explicitly exports every supported type, interface, and declared function.
- [x] Dates use ISO string aliases at domain boundaries.
- [x] No runtime implementation, UI, API, authentication, persistence, validation, mock data, or seed data exists.
