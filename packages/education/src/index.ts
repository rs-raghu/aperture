export type {
  DateRange,
  EducationEntityStatus,
  EntityMetadata,
  IsoDateString,
  IsoDateTimeString,
  OwnerId,
  OwnerQuery,
  PageRequest,
  PageResult,
  SortDirection,
} from "./education.types.js";
export type { EducationDomainError, EducationErrorCode } from "./education.errors.js";

export type { Institution, InstitutionId, InstitutionStatus } from "./institutions/institution.types.js";
export type {
  CreateInstitutionInput,
  InstitutionListQuery,
  UpdateInstitutionInput,
} from "./institutions/institution.contracts.js";
export {
  archiveInstitution,
  createInstitution,
  getInstitution,
  listInstitutions,
  updateInstitution,
} from "./institutions/institution.contracts.js";
export type { InstitutionRepository } from "./institutions/institution.repository.js";

export type { AcademicProgram, ProgramId, ProgramStatus } from "./programs/program.types.js";
export type { CreateProgramInput, ProgramListQuery, UpdateProgramInput } from "./programs/program.contracts.js";
export { archiveProgram, createProgram, getProgram, listPrograms, updateProgram } from "./programs/program.contracts.js";
export type { ProgramRepository } from "./programs/program.repository.js";

export type { Semester, SemesterId, SemesterStatus } from "./semesters/semester.types.js";
export type {
  CreateSemesterInput,
  SemesterListQuery,
  UpdateSemesterInput,
} from "./semesters/semester.contracts.js";
export {
  activateSemester,
  completeSemester,
  createSemester,
  getSemester,
  listSemesters,
  updateSemester,
} from "./semesters/semester.contracts.js";
export type { SemesterRepository } from "./semesters/semester.repository.js";

export type { Course, CourseId, CourseStatus } from "./courses/course.types.js";
export type {
  CourseListQuery,
  CoursesBySemesterQuery,
  CreateCourseInput,
  UpdateCourseInput,
} from "./courses/course.contracts.js";
export {
  archiveCourse,
  createCourse,
  getCourse,
  listCourses,
  listCoursesBySemester,
  updateCourse,
} from "./courses/course.contracts.js";
export type { CourseRepository } from "./courses/course.repository.js";

export type { CourseTopic, TopicId, TopicStatus } from "./topics/topic.types.js";
export type { CreateTopicInput, TopicsByCourseQuery, UpdateTopicInput } from "./topics/topic.contracts.js";
export { createTopic, getTopic, listTopicsByCourse, markTopicComplete, updateTopic } from "./topics/topic.contracts.js";
export type { TopicRepository } from "./topics/topic.repository.js";

export type { Assignment, AssignmentId, AssignmentStatus } from "./assignments/assignment.types.js";
export type {
  AssignmentListQuery,
  CreateAssignmentInput,
  SubmitAssignmentInput,
  UpcomingAssignmentsQuery,
  UpdateAssignmentInput,
} from "./assignments/assignment.contracts.js";
export {
  createAssignment,
  getAssignment,
  getUpcomingAssignments,
  listAssignments,
  markAssignmentComplete,
  submitAssignment,
  updateAssignment,
} from "./assignments/assignment.contracts.js";
export type { AssignmentRepository } from "./assignments/assignment.repository.js";

export type { Exam, ExamId, ExamStatus } from "./exams/exam.types.js";
export type {
  CreateExamInput,
  ExamListQuery,
  UpcomingExamsQuery,
  UpdateExamInput,
} from "./exams/exam.contracts.js";
export { completeExam, createExam, getExam, getUpcomingExams, listExams, updateExam } from "./exams/exam.contracts.js";
export type { ExamRepository } from "./exams/exam.repository.js";

export type { Grade, GradeId } from "./grades/grade.types.js";
export type {
  GradesByCourseQuery,
  GradesBySemesterQuery,
  RecordGradeInput,
  UpdateGradeInput,
} from "./grades/grade.contracts.js";
export { deleteGrade, getGrade, listGradesByCourse, listGradesBySemester, recordGrade, updateGrade } from "./grades/grade.contracts.js";
export type { GradeRepository } from "./grades/grade.repository.js";

export type { AttendanceRecord, AttendanceRecordId, AttendanceStatus } from "./attendance/attendance.types.js";
export type {
  AttendanceByCourseQuery,
  CourseAttendanceSummary,
  CourseAttendanceSummaryQuery,
  RecordAttendanceInput,
  UpdateAttendanceInput,
} from "./attendance/attendance.contracts.js";
export {
  deleteAttendance,
  getCourseAttendanceSummary,
  listAttendanceByCourse,
  recordAttendance,
  updateAttendance,
} from "./attendance/attendance.contracts.js";
export type { AttendanceRepository } from "./attendance/attendance.repository.js";

export type { StudySession, StudySessionId, StudySessionStatus } from "./study-sessions/study-session.types.js";
export type {
  ScheduleStudySessionInput,
  StudySessionListQuery,
  StudySessionsByCourseQuery,
  UpdateStudySessionInput,
} from "./study-sessions/study-session.contracts.js";
export {
  cancelStudySession,
  completeStudySession,
  getStudySession,
  listStudySessions,
  listStudySessionsByCourse,
  scheduleStudySession,
  startStudySession,
} from "./study-sessions/study-session.contracts.js";
export type { StudySessionRepository } from "./study-sessions/study-session.repository.js";

export type { ScheduleEntry, ScheduleEntryId, ScheduleEntryStatus } from "./schedules/schedule.types.js";
export type {
  CreateScheduleEntryInput,
  ScheduleEntryListQuery,
  UpdateScheduleEntryInput,
} from "./schedules/schedule.contracts.js";
export {
  createScheduleEntry,
  deleteScheduleEntry,
  getScheduleEntry,
  listScheduleEntries,
  updateScheduleEntry,
} from "./schedules/schedule.contracts.js";
export type { ScheduleRepository } from "./schedules/schedule.repository.js";

export type { LearningResource, ResourceId, ResourceKind, ResourceStatus } from "./resources/resource.types.js";
export type { CreateResourceInput, ResourcesByCourseQuery, UpdateResourceInput } from "./resources/resource.contracts.js";
export { archiveResource, createResource, getResource, listResourcesByCourse, updateResource } from "./resources/resource.contracts.js";
export type { ResourceRepository } from "./resources/resource.repository.js";

export type { Certificate, CertificateId, CertificateStatus } from "./certificates/certificate.types.js";
export type {
  CertificateListQuery,
  CreateCertificateInput,
  UpdateCertificateInput,
} from "./certificates/certificate.contracts.js";
export { createCertificate, deleteCertificate, getCertificate, listCertificates, updateCertificate } from "./certificates/certificate.contracts.js";
export type { CertificateRepository } from "./certificates/certificate.repository.js";

export type {
  EducationGoal,
  EducationGoalId,
  EducationGoalStatus,
} from "./goals/education-goal.types.js";
export type {
  CreateEducationGoalInput,
  EducationGoalListQuery,
  UpdateEducationGoalInput,
} from "./goals/education-goal.contracts.js";
export {
  archiveEducationGoal,
  completeEducationGoal,
  createEducationGoal,
  getEducationGoal,
  listEducationGoals,
  updateEducationGoal,
} from "./goals/education-goal.contracts.js";
export type { EducationGoalRepository } from "./goals/education-goal.repository.js";

export type { CgpaCalculationInput, CgpaCalculationResult, CgpaSemesterInput } from "./calculations/cgpa.contracts.js";
export { calculateCgpa } from "./calculations/cgpa.contracts.js";
export type {
  AttendancePercentageCalculationInput,
  AttendancePercentageCalculationResult,
} from "./calculations/attendance-percentage.contracts.js";
export { calculateAttendancePercentage } from "./calculations/attendance-percentage.contracts.js";
export type {
  DegreeProgressCalculationInput,
  DegreeProgressCalculationResult,
} from "./calculations/degree-progress.contracts.js";
export { calculateDegreeProgress } from "./calculations/degree-progress.contracts.js";
export type { GpaCalculationInput, GpaCalculationResult, GpaCourseInput } from "./calculations/gpa.contracts.js";
export { calculateGpa } from "./calculations/gpa.contracts.js";
export type {
  GradeProjectionInput,
  GradeProjectionResult,
  PlannedGradeComponentInput,
} from "./calculations/grade-projection.contracts.js";
export { projectCourseGrade } from "./calculations/grade-projection.contracts.js";
export type {
  RequiredScoreCalculationInput,
  RequiredScoreCalculationResult,
} from "./calculations/required-score.contracts.js";
export { calculateRequiredScore } from "./calculations/required-score.contracts.js";
export type {
  WeightedGradeCalculationInput,
  WeightedGradeCalculationResult,
  WeightedGradeComponentInput,
} from "./calculations/weighted-grade.contracts.js";
export { calculateWeightedGrade } from "./calculations/weighted-grade.contracts.js";

export type {
  CrudRepository,
  ReadRepository,
  RepositoryFilter,
  WriteRepository,
} from "./repositories/repository.types.js";
export type { EducationRepository } from "./repositories/education-repository.contract.js";
export type {
  AcademicPerformanceSummary,
  AcademicPerformanceSummaryQuery,
  CourseProgress,
  CurrentSemesterSummary,
  CurrentSemesterSummaryQuery,
  EducationOverview,
  EducationService,
  StudyTimeSummary,
  StudyTimeSummaryQuery,
  UpcomingDeadline,
  UpcomingDeadlineKind,
  UpcomingDeadlinesQuery,
} from "./services/education-service.contract.js";
