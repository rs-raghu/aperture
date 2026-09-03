import type {
  AcademicProgram,
  Assignment,
  AttendanceRecord,
  Certificate,
  Course,
  CourseTopic,
  EducationGoal,
  Exam,
  Grade,
  Institution,
  LearningResource,
  ScheduleEntry,
  Semester,
  StudySession,
} from "@aperture/education";

export const OWNER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const OWNER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export const CREATED_AT = "2026-09-03T08:00:00Z";
export const UPDATED_AT = "2026-09-03T09:00:00Z";

export const FIXTURE_IDS = {
  institution: "00000000-0000-4000-8000-000000000001",
  program: "00000000-0000-4000-8000-000000000002",
  semester: "00000000-0000-4000-8000-000000000003",
  course: "00000000-0000-4000-8000-000000000004",
  topic: "00000000-0000-4000-8000-000000000005",
  assignment: "00000000-0000-4000-8000-000000000006",
  exam: "00000000-0000-4000-8000-000000000007",
  grade: "00000000-0000-4000-8000-000000000008",
  attendance: "00000000-0000-4000-8000-000000000009",
  studySession: "00000000-0000-4000-8000-000000000010",
  schedule: "00000000-0000-4000-8000-000000000011",
  resource: "00000000-0000-4000-8000-000000000012",
  certificate: "00000000-0000-4000-8000-000000000013",
  goal: "00000000-0000-4000-8000-000000000014",
  alternate: "00000000-0000-4000-8000-000000000099",
} as const;

const metadata = { ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT } as const;

function fixture<TEntity>(base: TEntity, overrides: Partial<TEntity>): TEntity {
  return { ...base, ...overrides };
}

export function buildInstitution(overrides: Partial<Institution> = {}): Institution {
  return fixture({ ...metadata, id: FIXTURE_IDS.institution, name: "Synthetic Academy", type: "university", status: "active" }, overrides);
}

export function buildProgram(overrides: Partial<AcademicProgram> = {}): AcademicProgram {
  return fixture({ ...metadata, id: FIXTURE_IDS.program, institutionId: FIXTURE_IDS.institution, name: "Synthetic Program", programType: "degree", startsOn: "2026-01-01", requiredCredits: "120.00", status: "active" }, overrides);
}

export function buildSemester(overrides: Partial<Semester> = {}): Semester {
  return fixture({ ...metadata, id: FIXTURE_IDS.semester, programId: FIXTURE_IDS.program, name: "Semester One", academicYear: "2026", sequence: 1, startsOn: "2026-01-01", endsOn: "2026-06-30", status: "active" }, overrides);
}

export function buildCourse(overrides: Partial<Course> = {}): Course {
  return fixture({ ...metadata, id: FIXTURE_IDS.course, semesterId: FIXTURE_IDS.semester, code: "SYN-101", name: "Synthetic Course", credits: "3.00", deliveryMode: "online", status: "active" }, overrides);
}

export function buildTopic(overrides: Partial<CourseTopic> = {}): CourseTopic {
  return fixture({ ...metadata, id: FIXTURE_IDS.topic, courseId: FIXTURE_IDS.course, title: "Synthetic Topic", sequence: 1, status: "planned" }, overrides);
}

export function buildAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return fixture({ ...metadata, id: FIXTURE_IDS.assignment, courseId: FIXTURE_IDS.course, title: "Synthetic Assignment", dueAt: "2026-10-01T08:00:00Z", maximumScore: "100.00", weightPercentage: "40.00", priority: "normal", status: "assigned" }, overrides);
}

export function buildExam(overrides: Partial<Exam> = {}): Exam {
  return fixture({ ...metadata, id: FIXTURE_IDS.exam, courseId: FIXTURE_IDS.course, semesterId: FIXTURE_IDS.semester, title: "Synthetic Exam", examType: "final", scheduledStartsAt: "2026-11-01T08:00:00Z", scheduledEndsAt: "2026-11-01T10:00:00Z", status: "scheduled" }, overrides);
}

export function buildGrade(overrides: Partial<Grade> = {}): Grade {
  return fixture({ ...metadata, id: FIXTURE_IDS.grade, courseId: FIXTURE_IDS.course, semesterId: FIXTURE_IDS.semester, assignmentId: FIXTURE_IDS.assignment, sourceType: "assignment", title: "Synthetic Grade", scoreEarned: "87.50", maximumScore: "100.00", gradePoints: "3.75", weightPercentage: "40.00", recordedAt: CREATED_AT }, overrides);
}

export function buildAttendance(overrides: Partial<AttendanceRecord> = {}): AttendanceRecord {
  return fixture({ ...metadata, id: FIXTURE_IDS.attendance, courseId: FIXTURE_IDS.course, sessionDate: "2026-09-03", status: "present", source: "manual" }, overrides);
}

export function buildStudySession(overrides: Partial<StudySession> = {}): StudySession {
  return fixture({ ...metadata, id: FIXTURE_IDS.studySession, courseId: FIXTURE_IDS.course, topicId: FIXTURE_IDS.topic, title: "Synthetic Study Session", plannedStartsAt: "2026-09-04T08:00:00Z", plannedEndsAt: "2026-09-04T09:00:00Z", plannedDurationMinutes: 60, method: "review", status: "scheduled" }, overrides);
}

export function buildScheduleEntry(overrides: Partial<ScheduleEntry> = {}): ScheduleEntry {
  return fixture({ ...metadata, id: FIXTURE_IDS.schedule, courseId: FIXTURE_IDS.course, title: "Synthetic Schedule Entry", startsAt: "2026-09-05T08:00:00Z", endsAt: "2026-09-05T09:00:00Z", entryType: "class", recurrence: { rule: "FREQ=WEEKLY", timeZone: "UTC" }, status: "scheduled" }, overrides);
}

export function buildResource(overrides: Partial<LearningResource> = {}): LearningResource {
  return fixture({ ...metadata, id: FIXTURE_IDS.resource, courseId: FIXTURE_IDS.course, topicId: FIXTURE_IDS.topic, title: "Synthetic Handbook", type: "book", status: "active" }, overrides);
}

export function buildCertificate(overrides: Partial<Certificate> = {}): Certificate {
  return fixture({ ...metadata, id: FIXTURE_IDS.certificate, courseId: FIXTURE_IDS.course, name: "Synthetic Certificate", issuingOrganization: "Synthetic Issuer", issuedOn: "2026-06-30", status: "earned" }, overrides);
}

export function buildEducationGoal(overrides: Partial<EducationGoal> = {}): EducationGoal {
  return fixture({ ...metadata, id: FIXTURE_IDS.goal, courseId: FIXTURE_IDS.course, title: "Synthetic Goal", goalType: "completion", targetValue: "1.00", targetUnit: "course", status: "active" }, overrides);
}
