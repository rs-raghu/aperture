import { describe, expect, it } from "vitest";

import {
  EducationApplicationError,
  createEducationService,
} from "@aperture/education";
import type {
  EducationOperationContext,
  EducationService,
} from "@aperture/education";
import { createEducationMemoryRepository } from "@aperture/education-memory";
import { OWNER_A, OWNER_B } from "../fixtures/education-fixtures.js";

const NOW = "2026-09-03T08:00:00Z";

interface IntegrationHarness {
  readonly service: EducationService;
  setNow(value: string): void;
}

function createHarness(): IntegrationHarness {
  let currentTime = NOW;
  let sequence = 1;
  return {
    setNow(value) {
      currentTime = value;
    },
    service: createEducationService({
      repositories: createEducationMemoryRepository(),
      clock: { now: () => currentTime },
      idGenerator: {
        generate: () => `20000000-0000-4000-8000-${String(sequence++).padStart(12, "0")}`,
      },
    }),
  };
}

async function createFoundation(service: EducationService, context: EducationOperationContext) {
  const institution = await service.createInstitution(context, {
    name: "Synthetic Academy",
    type: "university",
    status: "active",
  });
  const program = await service.createProgram(context, {
    institutionId: institution.id,
    name: "Synthetic Program",
    programType: "degree",
    startsOn: "2026-01-01",
    requiredCredits: "120.00",
    status: "active",
  });
  const semester = await service.createSemester(context, {
    programId: program.id,
    name: "Semester One",
    academicYear: "2026",
    sequence: 1,
    startsOn: "2026-01-01",
    endsOn: "2026-12-31",
    status: "planned",
  });
  const activeSemester = await service.activateSemester(context, semester.id);
  const course = await service.createCourse(context, {
    semesterId: activeSemester.id,
    code: "SYN-101",
    name: "Synthetic Course",
    credits: "3.00",
    deliveryMode: "online",
    status: "active",
  });
  return { institution, program, semester: activeSemester, course };
}

async function expectApplicationError(
  action: () => Promise<unknown>,
  code: EducationApplicationError["code"],
): Promise<void> {
  try {
    await action();
    throw new Error("Expected application error.");
  } catch (error) {
    expect(error).toBeInstanceOf(EducationApplicationError);
    expect((error as EducationApplicationError).code).toBe(code);
  }
}

describe("Education service with the memory adapter", () => {
  it("runs the representative Education workflow and all six summary paths", async () => {
    const harness = createHarness();
    const context = { ownerId: OWNER_A };
    const foundation = await createFoundation(harness.service, context);
    const topic = await harness.service.createTopic(context, {
      courseId: foundation.course.id,
      title: "Synthetic Topic",
      sequence: 1,
      status: "planned",
    });
    await harness.service.markTopicComplete(context, topic.id);
    const assignment = await harness.service.createAssignment(context, {
      courseId: foundation.course.id,
      topicId: topic.id,
      title: "Synthetic Assignment",
      dueAt: "2026-10-01T08:00:00Z",
      maximumScore: "100.00",
      weightPercentage: "100.00",
      priority: "normal",
      status: "assigned",
    });
    const exam = await harness.service.createExam(context, {
      courseId: foundation.course.id,
      semesterId: foundation.semester.id,
      title: "Synthetic Exam",
      examType: "final",
      scheduledStartsAt: "2026-11-01T08:00:00Z",
      scheduledEndsAt: "2026-11-01T10:00:00Z",
      status: "scheduled",
    });
    await harness.service.recordGrade(context, {
      courseId: foundation.course.id,
      semesterId: foundation.semester.id,
      assignmentId: assignment.id,
      sourceType: "assignment",
      title: "Synthetic Grade",
      scoreEarned: "87.50",
      maximumScore: "100.00",
      gradePoints: "3.75",
      weightPercentage: "100.00",
      recordedAt: NOW,
    });
    await harness.service.recordAttendance(context, {
      courseId: foundation.course.id,
      sessionDate: "2026-09-03",
      status: "present",
      source: "manual",
    });
    const study = await harness.service.scheduleStudySession(context, {
      courseId: foundation.course.id,
      topicId: topic.id,
      title: "Synthetic Review",
      plannedStartsAt: "2026-09-04T08:00:00Z",
      plannedEndsAt: "2026-09-04T09:15:00Z",
      plannedDurationMinutes: 75,
      actualDurationMinutes: 75,
      method: "review",
      status: "scheduled",
    });
    await harness.service.startStudySession(context, study.id);
    harness.setNow("2026-09-04T09:15:00Z");
    await harness.service.completeStudySession(context, study.id);

    const deadlines = await harness.service.getUpcomingDeadlines(context, {
      startsAt: "2026-09-03T00:00:00Z",
      endsAt: "2026-12-01T00:00:00Z",
    });
    expect(deadlines.map((item) => item.id)).toEqual([assignment.id, exam.id]);
    await expect(harness.service.getEducationOverview(context)).resolves.toMatchObject({
      currentSemesterId: foundation.semester.id,
      activeCourseCount: 1,
    });
    await expect(harness.service.getCurrentSemesterSummary(context)).resolves.toMatchObject({
      semester: { id: foundation.semester.id },
      courses: [{ id: foundation.course.id }],
    });
    await expect(harness.service.getCourseProgress(context, foundation.course.id)).resolves.toMatchObject({
      topics: { completedCount: 1, totalCount: 1, exactPercentage: "100" },
      assignments: { completedCount: 0, totalCount: 1, exactPercentage: "0" },
    });
    await expect(harness.service.getStudyTimeSummary(context, {
      range: { startsOn: "2026-09-01", endsOn: "2026-09-30" },
      courseId: foundation.course.id,
    })).resolves.toMatchObject({ totalMinutes: 75, sessionCount: 1, omittedSessionCount: 0 });
    await expect(harness.service.getAcademicPerformanceSummary(context, {
      semesterId: foundation.semester.id,
      gradePointScale: "4.00",
    })).resolves.toMatchObject({
      semesterGpa: { exactGpa: "3.75" },
      cumulativeGpa: { exactCgpa: "3.75" },
      courseGrades: [{ weightedGrade: { exactCurrentGrade: "87.5" } }],
    });
    await expect(harness.service.getCourseAttendanceSummary(context, foundation.course.id, "exclude")).resolves.toMatchObject({
      calculation: { exactAttendancePercentage: "100" },
    });
  });

  it("enforces relationship ownership, lifecycle, duplicates, active-semester, and archive conflicts", async () => {
    const harness = createHarness();
    const ownerA = { ownerId: OWNER_A };
    const ownerB = { ownerId: OWNER_B };
    const foundation = await createFoundation(harness.service, ownerA);

    await expectApplicationError(
      () => harness.service.createProgram(ownerB, {
        institutionId: foundation.institution.id,
        name: "Cross-owner Program",
        programType: "degree",
        startsOn: "2026-01-01",
        status: "active",
      }),
      "education-parent-not-found",
    );
    const secondSemester = await harness.service.createSemester(ownerA, {
      programId: foundation.program.id,
      name: "Semester Two",
      academicYear: "2026",
      sequence: 2,
      startsOn: "2026-07-01",
      endsOn: "2026-12-31",
      status: "planned",
    });
    await expectApplicationError(
      () => harness.service.completeSemester(ownerA, secondSemester.id),
      "education-invalid-state-transition",
    );
    await expectApplicationError(
      () => harness.service.activateSemester(ownerA, secondSemester.id),
      "education-conflict",
    );
    await expectApplicationError(
      () => harness.service.archiveInstitution(ownerA, foundation.institution.id),
      "education-related-records-exist",
    );

    const assignment = await harness.service.createAssignment(ownerA, {
      courseId: foundation.course.id,
      title: "Synthetic Assignment",
      priority: "normal",
      status: "assigned",
    });
    const gradeInput = {
      courseId: foundation.course.id,
      assignmentId: assignment.id,
      sourceType: "assignment" as const,
      title: "Synthetic Grade",
      scoreEarned: "90.00",
      maximumScore: "100.00",
      recordedAt: NOW,
    };
    await harness.service.recordGrade(ownerA, gradeInput);
    await expectApplicationError(() => harness.service.recordGrade(ownerA, gradeInput), "education-conflict");

    const attendanceInput = {
      courseId: foundation.course.id,
      sessionDate: "2026-09-03",
      status: "present" as const,
      source: "manual" as const,
    };
    await harness.service.recordAttendance(ownerA, attendanceInput);
    await expectApplicationError(() => harness.service.recordAttendance(ownerA, attendanceInput), "education-conflict");
  });

  it("excludes completed records from deadlines and preserves stable ordering", async () => {
    const harness = createHarness();
    const context = { ownerId: OWNER_A };
    const foundation = await createFoundation(harness.service, context);
    const first = await harness.service.createAssignment(context, {
      courseId: foundation.course.id,
      title: "First",
      dueAt: "2026-10-01T08:00:00Z",
      priority: "normal",
      status: "assigned",
    });
    const second = await harness.service.createAssignment(context, {
      courseId: foundation.course.id,
      title: "Second",
      dueAt: "2026-10-01T08:00:00Z",
      priority: "normal",
      status: "assigned",
    });
    const completed = await harness.service.createAssignment(context, {
      courseId: foundation.course.id,
      title: "Completed",
      dueAt: "2026-09-20T08:00:00Z",
      priority: "normal",
      status: "assigned",
    });
    await harness.service.submitAssignment(context, completed.id);
    await harness.service.markAssignmentComplete(context, completed.id);
    const exam = await harness.service.createExam(context, {
      courseId: foundation.course.id,
      title: "Completed Exam",
      examType: "final",
      scheduledStartsAt: "2026-09-25T08:00:00Z",
      scheduledEndsAt: "2026-09-25T10:00:00Z",
      status: "scheduled",
    });
    await harness.service.completeExam(context, exam.id);

    const deadlines = await harness.service.getUpcomingDeadlines(context, {
      startsAt: "2026-09-03T00:00:00Z",
      endsAt: "2026-11-01T00:00:00Z",
    });
    expect(deadlines.map((item) => item.id)).toEqual([first.id, second.id]);
  });

  it("keeps another owner's records out of overview and deadline summaries", async () => {
    const harness = createHarness();
    const ownerA = { ownerId: OWNER_A };
    const ownerB = { ownerId: OWNER_B };
    const foundationA = await createFoundation(harness.service, ownerA);
    const foundationB = await createFoundation(harness.service, ownerB);
    await harness.service.createAssignment(ownerA, {
      courseId: foundationA.course.id,
      title: "Owner A",
      dueAt: "2026-10-01T08:00:00Z",
      priority: "normal",
      status: "assigned",
    });
    await harness.service.createAssignment(ownerB, {
      courseId: foundationB.course.id,
      title: "Owner B",
      dueAt: "2026-10-01T08:00:00Z",
      priority: "normal",
      status: "assigned",
    });
    await expect(harness.service.getEducationOverview(ownerA)).resolves.toMatchObject({
      activeCourseCount: 1,
      upcomingAssignmentCount: 1,
    });
    const deadlines = await harness.service.getUpcomingDeadlines(ownerA, {
      startsAt: "2026-09-03T00:00:00Z",
      endsAt: "2026-11-01T00:00:00Z",
    });
    expect(deadlines.map((item) => item.title)).toEqual(["Owner A"]);
  });
});
