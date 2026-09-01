import type { AssignmentRepository } from "../assignments/assignment.repository.js";
import type { AttendanceRepository } from "../attendance/attendance.repository.js";
import type { CertificateRepository } from "../certificates/certificate.repository.js";
import type { CourseRepository } from "../courses/course.repository.js";
import type { ExamRepository } from "../exams/exam.repository.js";
import type { GradeRepository } from "../grades/grade.repository.js";
import type { EducationGoalRepository } from "../goals/education-goal.repository.js";
import type { InstitutionRepository } from "../institutions/institution.repository.js";
import type { ProgramRepository } from "../programs/program.repository.js";
import type { ResourceRepository } from "../resources/resource.repository.js";
import type { ScheduleRepository } from "../schedules/schedule.repository.js";
import type { SemesterRepository } from "../semesters/semester.repository.js";
import type { StudySessionRepository } from "../study-sessions/study-session.repository.js";
import type { TopicRepository } from "../topics/topic.repository.js";

export interface EducationRepository {
  readonly institutions: InstitutionRepository;
  readonly programs: ProgramRepository;
  readonly semesters: SemesterRepository;
  readonly courses: CourseRepository;
  readonly topics: TopicRepository;
  readonly assignments: AssignmentRepository;
  readonly exams: ExamRepository;
  readonly grades: GradeRepository;
  readonly attendance: AttendanceRepository;
  readonly studySessions: StudySessionRepository;
  readonly schedules: ScheduleRepository;
  readonly resources: ResourceRepository;
  readonly certificates: CertificateRepository;
  readonly goals: EducationGoalRepository;
}
