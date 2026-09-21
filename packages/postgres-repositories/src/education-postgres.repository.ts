import type {
  AcademicProgram,
  Assignment,
  AttendanceRecord,
  Certificate,
  Course,
  CourseTopic,
  EducationGoal,
  EducationRepository,
  Exam,
  Grade,
  Institution,
  LearningResource,
  ScheduleEntry,
  Semester,
  StudySession,
} from "@aperture/education";
import {
  academicProgramSchema,
  assignmentSchema,
  attendanceRecordSchema,
  certificateSchema,
  courseSchema,
  courseTopicSchema,
  educationGoalSchema,
  examSchema,
  gradeSchema,
  institutionSchema,
  learningResourceSchema,
  scheduleEntrySchema,
  semesterSchema,
  studySessionSchema,
} from "@aperture/education";
import {
  createAssignmentMemoryRepository,
  createAttendanceMemoryRepository,
  createCertificateMemoryRepository,
  createCourseMemoryRepository,
  createEducationGoalMemoryRepository,
  createExamMemoryRepository,
  createGradeMemoryRepository,
  createInstitutionMemoryRepository,
  createProgramMemoryRepository,
  createResourceMemoryRepository,
  createScheduleMemoryRepository,
  createSemesterMemoryRepository,
  createStudySessionMemoryRepository,
  createTopicMemoryRepository,
  EducationEntityCollection,
  type EducationEntityComparator,
  type EducationEntityMatcher,
  type EducationMemoryEntity,
  type EducationMemoryQuery,
} from "@aperture/education-memory/adapter-internals";

import type { SqlExecutor } from "./postgres.types.js";
import { PostgresCollection, type RuntimeSchema } from "./store/postgres-collection.js";

type RecordEntity = EducationMemoryEntity & Readonly<Record<string, unknown>>;

function field(entity: RecordEntity, name: string): unknown {
  return entity[name] ?? null;
}

function nestedField(entity: RecordEntity, objectName: string, name: string): unknown {
  const value = entity[objectName];
  return typeof value === "object" && value !== null
    ? (value as Readonly<Record<string, unknown>>)[name] ?? null
    : null;
}

const projections = {
  institutions: (entity: RecordEntity) => ({ name: field(entity, "name"), status: field(entity, "status") }),
  programs: (entity: RecordEntity) => ({ institution_id: field(entity, "institutionId"), name: field(entity, "name"), status: field(entity, "status") }),
  semesters: (entity: RecordEntity) => ({ program_id: field(entity, "programId"), name: field(entity, "name"), starts_on: field(entity, "startsOn"), ends_on: field(entity, "endsOn"), status: field(entity, "status") }),
  courses: (entity: RecordEntity) => ({ program_id: field(entity, "programId"), semester_id: field(entity, "semesterId"), code: field(entity, "code"), name: field(entity, "name"), credits: field(entity, "credits"), starts_on: field(entity, "startsOn"), ends_on: field(entity, "endsOn"), status: field(entity, "status") }),
  topics: (entity: RecordEntity) => ({ course_id: field(entity, "courseId"), name: field(entity, "title"), sequence: field(entity, "sequence") }),
  assignments: (entity: RecordEntity) => ({ course_id: field(entity, "courseId"), title: field(entity, "title"), due_at: field(entity, "dueAt"), max_points: field(entity, "maximumScore"), status: field(entity, "status") }),
  exams: (entity: RecordEntity) => ({ course_id: field(entity, "courseId"), title: field(entity, "title"), scheduled_at: field(entity, "scheduledStartsAt"), max_points: field(entity, "maximumScore"), status: field(entity, "status") }),
  grades: (entity: RecordEntity) => ({ course_id: field(entity, "courseId"), assignment_id: field(entity, "assignmentId"), exam_id: field(entity, "examId"), points_earned: field(entity, "scoreEarned"), points_possible: field(entity, "maximumScore"), grade_points: field(entity, "gradePoints"), recorded_at: field(entity, "recordedAt") }),
  attendance: (entity: RecordEntity) => ({ course_id: field(entity, "courseId"), occurred_on: field(entity, "sessionDate"), status: field(entity, "status") }),
  study_sessions: (entity: RecordEntity) => ({ course_id: field(entity, "courseId"), topic_id: field(entity, "topicId"), started_at: field(entity, "plannedStartsAt"), ended_at: field(entity, "plannedEndsAt"), duration_minutes: field(entity, "plannedDurationMinutes"), status: field(entity, "status") }),
  schedules: (entity: RecordEntity) => ({ course_id: field(entity, "courseId"), title: field(entity, "title"), starts_at: field(entity, "startsAt"), ends_at: field(entity, "endsAt"), recurrence_rule: nestedField(entity, "recurrence", "rule") }),
  resources: (entity: RecordEntity) => ({ course_id: field(entity, "courseId"), topic_id: field(entity, "topicId"), title: field(entity, "title"), resource_type: field(entity, "type"), resource_url: field(entity, "url") }),
  certificates: (entity: RecordEntity) => ({ institution_id: field(entity, "institutionId"), program_id: field(entity, "programId"), name: field(entity, "name"), issued_on: field(entity, "issuedOn"), expires_on: field(entity, "expiresOn") }),
  goals: (entity: RecordEntity) => ({ course_id: field(entity, "courseId"), title: field(entity, "title"), target_value: field(entity, "targetValue"), current_value: field(entity, "currentValue"), due_on: field(entity, "targetDate"), status: field(entity, "status") }),
} as const;

const entitySchemas = {
  institutions: institutionSchema,
  programs: academicProgramSchema,
  semesters: semesterSchema,
  courses: courseSchema,
  topics: courseTopicSchema,
  assignments: assignmentSchema,
  exams: examSchema,
  grades: gradeSchema,
  attendance: attendanceRecordSchema,
  study_sessions: studySessionSchema,
  schedules: scheduleEntrySchema,
  resources: learningResourceSchema,
  certificates: certificateSchema,
  goals: educationGoalSchema,
} as const;

class EducationPostgresCollection<TEntity extends EducationMemoryEntity>
  extends EducationEntityCollection<TEntity> {
  readonly #durable: PostgresCollection<TEntity>;

  public constructor(
    database: SqlExecutor,
    table: keyof typeof projections,
  ) {
    super(true);
    this.#durable = new PostgresCollection(database, {
      schema: "education",
      table,
      entitySchema: entitySchemas[table] as unknown as RuntimeSchema<TEntity>,
      project: projections[table] as unknown as (entity: TEntity) => Readonly<Record<string, unknown>>,
    });
  }

  public override create(entity: TEntity): Promise<TEntity> {
    return this.#durable.create(entity);
  }

  public override update(entity: TEntity): Promise<TEntity> {
    return this.#durable.update(entity);
  }

  public override delete(id: string, ownerId: TEntity["ownerId"]): Promise<void> {
    return this.#durable.delete(id, ownerId);
  }

  public override findById(id: string, ownerId: TEntity["ownerId"]): Promise<TEntity | null> {
    return this.#durable.findById(id, ownerId);
  }

  public override findFirst(
    ownerId: TEntity["ownerId"],
    predicate: (entity: TEntity) => boolean,
  ): Promise<TEntity | null> {
    return this.#durable.findFirst(ownerId, predicate);
  }

  public override findMany<TQuery extends EducationMemoryQuery>(
    query: TQuery,
    matches: EducationEntityMatcher<TEntity, TQuery>,
    compare: EducationEntityComparator<TEntity>,
  ) {
    return this.#durable.findMany(query, matches, compare);
  }
}

export function createEducationPostgresRepository(database: SqlExecutor): EducationRepository {
  const collection = <TEntity extends EducationMemoryEntity>(table: keyof typeof projections) =>
    new EducationPostgresCollection<TEntity>(database, table);

  return Object.freeze({
    institutions: Object.freeze(createInstitutionMemoryRepository(collection<Institution>("institutions"))),
    programs: Object.freeze(createProgramMemoryRepository(collection<AcademicProgram>("programs"))),
    semesters: Object.freeze(createSemesterMemoryRepository(collection<Semester>("semesters"))),
    courses: Object.freeze(createCourseMemoryRepository(collection<Course>("courses"))),
    topics: Object.freeze(createTopicMemoryRepository(collection<CourseTopic>("topics"))),
    assignments: Object.freeze(createAssignmentMemoryRepository(collection<Assignment>("assignments"))),
    exams: Object.freeze(createExamMemoryRepository(collection<Exam>("exams"))),
    grades: Object.freeze(createGradeMemoryRepository(collection<Grade>("grades"))),
    attendance: Object.freeze(createAttendanceMemoryRepository(collection<AttendanceRecord>("attendance"))),
    studySessions: Object.freeze(createStudySessionMemoryRepository(collection<StudySession>("study_sessions"))),
    schedules: Object.freeze(createScheduleMemoryRepository(collection<ScheduleEntry>("schedules"))),
    resources: Object.freeze(createResourceMemoryRepository(collection<LearningResource>("resources"))),
    certificates: Object.freeze(createCertificateMemoryRepository(collection<Certificate>("certificates"))),
    goals: Object.freeze(createEducationGoalMemoryRepository(collection<EducationGoal>("goals"))),
  });
}
