import { describe, expect, it } from "vitest";

import {
  academicProgramSchema,
  assignmentQuerySchema,
  assignmentSchema,
  attendanceQuerySchema,
  attendanceRecordSchema,
  certificateQuerySchema,
  certificateSchema,
  courseQuerySchema,
  courseSchema,
  courseTopicSchema,
  createAssignmentInputSchema,
  createAttendanceInputSchema,
  createCertificateInputSchema,
  createCourseInputSchema,
  createEducationGoalInputSchema,
  createExamInputSchema,
  createGradeInputSchema,
  createInstitutionInputSchema,
  createLearningResourceInputSchema,
  createProgramInputSchema,
  createScheduleEntryInputSchema,
  createSemesterInputSchema,
  createStudySessionInputSchema,
  createTopicInputSchema,
  educationGoalQuerySchema,
  educationGoalSchema,
  examQuerySchema,
  examSchema,
  gradeQuerySchema,
  gradeSchema,
  institutionQuerySchema,
  institutionSchema,
  isoDateSchema,
  isoDateTimeSchema,
  learningResourceQuerySchema,
  learningResourceSchema,
  nonNegativeDecimalStringSchema,
  programQuerySchema,
  scheduleEntryQuerySchema,
  scheduleEntrySchema,
  semesterQuerySchema,
  semesterSchema,
  studySessionQuerySchema,
  studySessionSchema,
  topicQuerySchema,
  updateAssignmentInputSchema,
  updateAttendanceInputSchema,
  updateCertificateInputSchema,
  updateCourseInputSchema,
  updateEducationGoalInputSchema,
  updateExamInputSchema,
  updateGradeInputSchema,
  updateInstitutionInputSchema,
  updateLearningResourceInputSchema,
  updateProgramInputSchema,
  updateScheduleEntryInputSchema,
  updateSemesterInputSchema,
  updateStudySessionInputSchema,
  updateTopicInputSchema,
} from "../src/index.js";
import type { ZodType } from "@aperture/validation";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const INSTITUTION_ID = "22222222-2222-4222-8222-222222222222";
const PROGRAM_ID = "33333333-3333-4333-8333-333333333333";
const SEMESTER_ID = "44444444-4444-4444-8444-444444444444";
const COURSE_ID = "55555555-5555-4555-8555-555555555555";
const TOPIC_ID = "66666666-6666-4666-8666-666666666666";
const ASSIGNMENT_ID = "77777777-7777-4777-8777-777777777777";
const EXAM_ID = "88888888-8888-4888-8888-888888888888";
const GRADE_ID = "99999999-9999-4999-8999-999999999999";
const ATTENDANCE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const STUDY_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const SCHEDULE_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const RESOURCE_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const CERTIFICATE_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const GOAL_ID = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const CREATED_AT = "2026-09-03T10:00:00+05:30";
const UPDATED_AT = "2026-09-03T10:30:00+05:30";

interface EntityCase {
  readonly name: string;
  readonly storedSchema: ZodType<unknown>;
  readonly createSchema: ZodType<unknown>;
  readonly updateSchema: ZodType<unknown>;
  readonly querySchema: ZodType<unknown>;
  readonly stored: Readonly<Record<string, unknown>>;
  readonly create: Readonly<Record<string, unknown>>;
  readonly update: Readonly<Record<string, unknown>>;
  readonly query: Readonly<Record<string, unknown>>;
  readonly requiredField: string;
  readonly relatedField?: string;
}

const metadata = { ownerId: OWNER_ID, createdAt: CREATED_AT, updatedAt: UPDATED_AT };

const cases: readonly EntityCase[] = [
  {
    name: "Institution",
    storedSchema: institutionSchema,
    createSchema: createInstitutionInputSchema,
    updateSchema: updateInstitutionInputSchema,
    querySchema: institutionQuerySchema,
    stored: { ...metadata, id: INSTITUTION_ID, name: "Synthetic Institution", type: "university", status: "active" },
    create: { ownerId: OWNER_ID, name: "Synthetic Institution", type: "university", status: "active" },
    update: { id: INSTITUTION_ID, shortName: "SI" },
    query: { ownerId: OWNER_ID },
    requiredField: "name",
  },
  {
    name: "Academic program",
    storedSchema: academicProgramSchema,
    createSchema: createProgramInputSchema,
    updateSchema: updateProgramInputSchema,
    querySchema: programQuerySchema,
    stored: { ...metadata, id: PROGRAM_ID, institutionId: INSTITUTION_ID, name: "Synthetic Program", programType: "degree", startsOn: "2026-01-01", status: "active" },
    create: { ownerId: OWNER_ID, institutionId: INSTITUTION_ID, name: "Synthetic Program", programType: "degree", startsOn: "2026-01-01", status: "active" },
    update: { id: PROGRAM_ID, fieldOfStudy: "Synthetic Field" },
    query: { ownerId: OWNER_ID },
    requiredField: "institutionId",
    relatedField: "institutionId",
  },
  {
    name: "Semester",
    storedSchema: semesterSchema,
    createSchema: createSemesterInputSchema,
    updateSchema: updateSemesterInputSchema,
    querySchema: semesterQuerySchema,
    stored: { ...metadata, id: SEMESTER_ID, programId: PROGRAM_ID, name: "Synthetic Semester", academicYear: "2026", sequence: 1, startsOn: "2026-01-01", endsOn: "2026-05-31", status: "active" },
    create: { ownerId: OWNER_ID, programId: PROGRAM_ID, name: "Synthetic Semester", academicYear: "2026", sequence: 1, startsOn: "2026-01-01", endsOn: "2026-05-31", status: "active" },
    update: { id: SEMESTER_ID, name: "Updated Semester" },
    query: { ownerId: OWNER_ID },
    requiredField: "programId",
    relatedField: "programId",
  },
  {
    name: "Course",
    storedSchema: courseSchema,
    createSchema: createCourseInputSchema,
    updateSchema: updateCourseInputSchema,
    querySchema: courseQuerySchema,
    stored: { ...metadata, id: COURSE_ID, semesterId: SEMESTER_ID, name: "Synthetic Course", deliveryMode: "online", status: "active" },
    create: { ownerId: OWNER_ID, semesterId: SEMESTER_ID, name: "Synthetic Course", deliveryMode: "online", status: "active" },
    update: { id: COURSE_ID, code: "SYN-101" },
    query: { ownerId: OWNER_ID },
    requiredField: "semesterId",
    relatedField: "semesterId",
  },
  {
    name: "Topic",
    storedSchema: courseTopicSchema,
    createSchema: createTopicInputSchema,
    updateSchema: updateTopicInputSchema,
    querySchema: topicQuerySchema,
    stored: { ...metadata, id: TOPIC_ID, courseId: COURSE_ID, title: "Synthetic Topic", sequence: 1, status: "planned" },
    create: { ownerId: OWNER_ID, courseId: COURSE_ID, title: "Synthetic Topic", sequence: 1, status: "planned" },
    update: { id: TOPIC_ID, title: "Updated Topic" },
    query: { ownerId: OWNER_ID, courseId: COURSE_ID },
    requiredField: "courseId",
    relatedField: "courseId",
  },
  {
    name: "Assignment",
    storedSchema: assignmentSchema,
    createSchema: createAssignmentInputSchema,
    updateSchema: updateAssignmentInputSchema,
    querySchema: assignmentQuerySchema,
    stored: { ...metadata, id: ASSIGNMENT_ID, courseId: COURSE_ID, title: "Synthetic Assignment", priority: "normal", status: "assigned" },
    create: { ownerId: OWNER_ID, courseId: COURSE_ID, title: "Synthetic Assignment", priority: "normal", status: "assigned" },
    update: { id: ASSIGNMENT_ID, priority: "high" },
    query: { ownerId: OWNER_ID },
    requiredField: "courseId",
    relatedField: "courseId",
  },
  {
    name: "Exam",
    storedSchema: examSchema,
    createSchema: createExamInputSchema,
    updateSchema: updateExamInputSchema,
    querySchema: examQuerySchema,
    stored: { ...metadata, id: EXAM_ID, courseId: COURSE_ID, title: "Synthetic Exam", examType: "final", scheduledStartsAt: "2026-05-01T09:00:00Z", scheduledEndsAt: "2026-05-01T11:00:00Z", status: "scheduled" },
    create: { ownerId: OWNER_ID, courseId: COURSE_ID, title: "Synthetic Exam", examType: "final", scheduledStartsAt: "2026-05-01T09:00:00Z", scheduledEndsAt: "2026-05-01T11:00:00Z", status: "scheduled" },
    update: { id: EXAM_ID, location: "Synthetic Room" },
    query: { ownerId: OWNER_ID },
    requiredField: "courseId",
    relatedField: "courseId",
  },
  {
    name: "Grade",
    storedSchema: gradeSchema,
    createSchema: createGradeInputSchema,
    updateSchema: updateGradeInputSchema,
    querySchema: gradeQuerySchema,
    stored: { ...metadata, id: GRADE_ID, courseId: COURSE_ID, sourceType: "manual", title: "Synthetic Grade", scoreEarned: "75", maximumScore: "100", recordedAt: CREATED_AT },
    create: { ownerId: OWNER_ID, courseId: COURSE_ID, sourceType: "manual", title: "Synthetic Grade", scoreEarned: "75", maximumScore: "100", recordedAt: CREATED_AT },
    update: { id: GRADE_ID, letterGrade: "A" },
    query: { ownerId: OWNER_ID },
    requiredField: "courseId",
    relatedField: "courseId",
  },
  {
    name: "Attendance record",
    storedSchema: attendanceRecordSchema,
    createSchema: createAttendanceInputSchema,
    updateSchema: updateAttendanceInputSchema,
    querySchema: attendanceQuerySchema,
    stored: { ...metadata, id: ATTENDANCE_ID, courseId: COURSE_ID, sessionDate: "2026-04-01", status: "present", source: "manual" },
    create: { ownerId: OWNER_ID, courseId: COURSE_ID, sessionDate: "2026-04-01", status: "present", source: "manual" },
    update: { id: ATTENDANCE_ID, status: "late" },
    query: { ownerId: OWNER_ID },
    requiredField: "courseId",
    relatedField: "courseId",
  },
  {
    name: "Study session",
    storedSchema: studySessionSchema,
    createSchema: createStudySessionInputSchema,
    updateSchema: updateStudySessionInputSchema,
    querySchema: studySessionQuerySchema,
    stored: { ...metadata, id: STUDY_ID, courseId: COURSE_ID, title: "Synthetic Study", plannedStartsAt: "2026-04-01T10:00:00Z", method: "review", status: "scheduled" },
    create: { ownerId: OWNER_ID, courseId: COURSE_ID, title: "Synthetic Study", plannedStartsAt: "2026-04-01T10:00:00Z", method: "review", status: "scheduled" },
    update: { id: STUDY_ID, focusRating: 4 },
    query: { ownerId: OWNER_ID },
    requiredField: "courseId",
    relatedField: "courseId",
  },
  {
    name: "Schedule entry",
    storedSchema: scheduleEntrySchema,
    createSchema: createScheduleEntryInputSchema,
    updateSchema: updateScheduleEntryInputSchema,
    querySchema: scheduleEntryQuerySchema,
    stored: { ...metadata, id: SCHEDULE_ID, courseId: COURSE_ID, title: "Synthetic Schedule", startsAt: "2026-04-01T10:00:00Z", endsAt: "2026-04-01T11:00:00Z", entryType: "class", status: "scheduled" },
    create: { ownerId: OWNER_ID, courseId: COURSE_ID, title: "Synthetic Schedule", startsAt: "2026-04-01T10:00:00Z", endsAt: "2026-04-01T11:00:00Z", entryType: "class", status: "scheduled" },
    update: { id: SCHEDULE_ID, location: "Synthetic Room" },
    query: { ownerId: OWNER_ID },
    requiredField: "title",
    relatedField: "courseId",
  },
  {
    name: "Learning resource",
    storedSchema: learningResourceSchema,
    createSchema: createLearningResourceInputSchema,
    updateSchema: updateLearningResourceInputSchema,
    querySchema: learningResourceQuerySchema,
    stored: { ...metadata, id: RESOURCE_ID, courseId: COURSE_ID, title: "Synthetic Resource", type: "book", status: "active" },
    create: { ownerId: OWNER_ID, courseId: COURSE_ID, title: "Synthetic Resource", type: "book", status: "active" },
    update: { id: RESOURCE_ID, author: "Synthetic Author" },
    query: { ownerId: OWNER_ID, courseId: COURSE_ID },
    requiredField: "courseId",
    relatedField: "courseId",
  },
  {
    name: "Certificate",
    storedSchema: certificateSchema,
    createSchema: createCertificateInputSchema,
    updateSchema: updateCertificateInputSchema,
    querySchema: certificateQuerySchema,
    stored: { ...metadata, id: CERTIFICATE_ID, courseId: COURSE_ID, name: "Synthetic Certificate", issuingOrganization: "Synthetic Issuer", status: "earned" },
    create: { ownerId: OWNER_ID, courseId: COURSE_ID, name: "Synthetic Certificate", issuingOrganization: "Synthetic Issuer", status: "earned" },
    update: { id: CERTIFICATE_ID, credentialId: "SYNTHETIC" },
    query: { ownerId: OWNER_ID },
    requiredField: "name",
    relatedField: "courseId",
  },
  {
    name: "Education goal",
    storedSchema: educationGoalSchema,
    createSchema: createEducationGoalInputSchema,
    updateSchema: updateEducationGoalInputSchema,
    querySchema: educationGoalQuerySchema,
    stored: { ...metadata, id: GOAL_ID, courseId: COURSE_ID, title: "Synthetic Goal", goalType: "completion", status: "active" },
    create: { ownerId: OWNER_ID, courseId: COURSE_ID, title: "Synthetic Goal", goalType: "completion", status: "active" },
    update: { id: GOAL_ID, targetValue: "1" },
    query: { ownerId: OWNER_ID },
    requiredField: "title",
    relatedField: "courseId",
  },
];

function withoutField(
  value: Readonly<Record<string, unknown>>,
  field: string,
): Readonly<Record<string, unknown>> {
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== field));
}

describe.each(cases)("$name schema family", (model) => {
  it("accepts a valid stored entity", () => {
    expect(model.storedSchema.safeParse(model.stored).success).toBe(true);
  });

  it("accepts a valid create input", () => {
    expect(model.createSchema.safeParse(model.create).success).toBe(true);
  });

  it("accepts a valid update input", () => {
    expect(model.updateSchema.safeParse(model.update).success).toBe(true);
  });

  it("accepts a valid query", () => {
    expect(model.querySchema.safeParse(model.query).success).toBe(true);
  });

  it("rejects a missing required field", () => {
    expect(model.storedSchema.safeParse(withoutField(model.stored, model.requiredField)).success).toBe(false);
  });

  it("rejects an invalid owner identifier", () => {
    expect(model.storedSchema.safeParse({ ...model.stored, ownerId: "invalid" }).success).toBe(false);
  });

  it("rejects an invalid related identifier when a relationship applies", () => {
    if (model.relatedField === undefined) return;
    expect(model.storedSchema.safeParse({ ...model.stored, [model.relatedField]: "invalid" }).success).toBe(false);
  });

  it("rejects a malformed timestamp", () => {
    expect(model.storedSchema.safeParse({ ...model.stored, createdAt: "2026-09-03T10:00:00" }).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(model.storedSchema.safeParse({ ...model.stored, unknownField: true }).success).toBe(false);
  });

  it("rejects an empty update", () => {
    expect(model.updateSchema.safeParse({ id: model.update.id }).success).toBe(false);
  });

  it("rejects owner reassignment through an update", () => {
    expect(model.updateSchema.safeParse({ ...model.update, ownerId: OWNER_ID }).success).toBe(false);
  });
});

describe("Education primitive and cross-field validation", () => {
  it("rejects invalid calendar dates and ambiguous locale dates", () => {
    expect(isoDateSchema.safeParse("2026-02-30").success).toBe(false);
    expect(isoDateSchema.safeParse("03/04/2026").success).toBe(false);
  });

  it("rejects timestamps without an explicit timezone", () => {
    expect(isoDateTimeSchema.safeParse("2026-09-03T10:00:00").success).toBe(false);
    expect(isoDateTimeSchema.safeParse("2026-02-30T10:00:00Z").success).toBe(false);
  });

  it.each(["NaN", "Infinity", "1e3", "$10", "1,000", "", "01.0"])(
    "rejects non-normalized decimal %s",
    (value) => {
      expect(nonNegativeDecimalStringSchema.safeParse(value).success).toBe(false);
    },
  );

  it("rejects negative values where prohibited", () => {
    expect(nonNegativeDecimalStringSchema.safeParse("-1").success).toBe(false);
    expect(createAttendanceInputSchema.safeParse({ ...cases[8]!.create, scheduledDurationMinutes: -1 }).success).toBe(false);
  });

  it("rejects end-before-start ranges", () => {
    expect(createSemesterInputSchema.safeParse({ ...cases[2]!.create, endsOn: "2025-12-31" }).success).toBe(false);
    expect(createExamInputSchema.safeParse({ ...cases[6]!.create, scheduledEndsAt: "2026-05-01T08:00:00Z" }).success).toBe(false);
    expect(createCertificateInputSchema.safeParse({ ...cases[12]!.create, issuedOn: "2026-05-01", expiresOn: "2026-04-30" }).success).toBe(false);
  });

  it("rejects invalid statuses", () => {
    expect(institutionSchema.safeParse({ ...cases[0]!.stored, status: "unknown" }).success).toBe(false);
  });

  it("rejects excessive title lengths", () => {
    expect(createAssignmentInputSchema.safeParse({ ...cases[5]!.create, title: "x".repeat(201) }).success).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(createAssignmentInputSchema.safeParse({ ...cases[5]!.create, externalUrl: "not a url" }).success).toBe(false);
  });

  it("rejects conflicting grade relationships", () => {
    expect(createGradeInputSchema.safeParse({
      ...cases[7]!.create,
      sourceType: "assignment",
      assignmentId: ASSIGNMENT_ID,
      examId: EXAM_ID,
    }).success).toBe(false);
  });

  it("rejects multiple goal scope relationships", () => {
    expect(createEducationGoalInputSchema.safeParse({
      ...cases[13]!.create,
      programId: PROGRAM_ID,
      courseId: COURSE_ID,
    }).success).toBe(false);
  });
});
