import type { EducationRepository } from "@aperture/education";

import type { CreateEducationMemoryRepositoryOptions } from "./education-memory.types.js";
import { createAssignmentMemoryRepository } from "./repositories/assignment-memory.repository.js";
import { createAttendanceMemoryRepository } from "./repositories/attendance-memory.repository.js";
import { createCertificateMemoryRepository } from "./repositories/certificate-memory.repository.js";
import { createCourseMemoryRepository } from "./repositories/course-memory.repository.js";
import { createEducationGoalMemoryRepository } from "./repositories/education-goal-memory.repository.js";
import { createExamMemoryRepository } from "./repositories/exam-memory.repository.js";
import { createGradeMemoryRepository } from "./repositories/grade-memory.repository.js";
import { createInstitutionMemoryRepository } from "./repositories/institution-memory.repository.js";
import { createProgramMemoryRepository } from "./repositories/program-memory.repository.js";
import { createResourceMemoryRepository } from "./repositories/resource-memory.repository.js";
import { createScheduleMemoryRepository } from "./repositories/schedule-memory.repository.js";
import { createSemesterMemoryRepository } from "./repositories/semester-memory.repository.js";
import { createStudySessionMemoryRepository } from "./repositories/study-session-memory.repository.js";
import { createTopicMemoryRepository } from "./repositories/topic-memory.repository.js";
import { EducationMemoryStore } from "./store/memory-store.js";

export function createEducationMemoryRepository(
  options: CreateEducationMemoryRepositoryOptions = {},
): EducationRepository {
  const store = new EducationMemoryStore(options.cloneValues ?? true);
  return Object.freeze({
    institutions: Object.freeze(createInstitutionMemoryRepository(store.institutions)),
    programs: Object.freeze(createProgramMemoryRepository(store.programs)),
    semesters: Object.freeze(createSemesterMemoryRepository(store.semesters)),
    courses: Object.freeze(createCourseMemoryRepository(store.courses)),
    topics: Object.freeze(createTopicMemoryRepository(store.topics)),
    assignments: Object.freeze(createAssignmentMemoryRepository(store.assignments)),
    exams: Object.freeze(createExamMemoryRepository(store.exams)),
    grades: Object.freeze(createGradeMemoryRepository(store.grades)),
    attendance: Object.freeze(createAttendanceMemoryRepository(store.attendance)),
    studySessions: Object.freeze(createStudySessionMemoryRepository(store.studySessions)),
    schedules: Object.freeze(createScheduleMemoryRepository(store.schedules)),
    resources: Object.freeze(createResourceMemoryRepository(store.resources)),
    certificates: Object.freeze(createCertificateMemoryRepository(store.certificates)),
    goals: Object.freeze(createEducationGoalMemoryRepository(store.goals)),
  });
}
