import type { OwnerScopedInput, EducationOperationContext } from "../application/application.types.js";
import type { Assignment, AssignmentId, AssignmentListQuery, CreateAssignmentInput, UpdateAssignmentInput, UpcomingAssignmentsQuery } from "../assignments/assignment.types.js";
import type { AttendanceByCourseQuery, AttendanceRecord, AttendanceRecordId, RecordAttendanceInput, UpdateAttendanceInput } from "../attendance/attendance.types.js";
import type { ExcusedAttendancePolicy, AttendancePercentageCalculationResult, CgpaCalculationResult, GpaCalculationResult, WeightedGradeCalculationResult } from "../calculations.js";
import type { Certificate, CertificateId, CertificateListQuery, CreateCertificateInput, UpdateCertificateInput } from "../certificates/certificate.types.js";
import type { Course, CourseId, CourseListQuery, CoursesBySemesterQuery, CreateCourseInput, UpdateCourseInput } from "../courses/course.types.js";
import type { DateRange, IsoDateTimeString, PageResult } from "../education.types.js";
import type { CreateExamInput, Exam, ExamId, ExamListQuery, UpcomingExamsQuery, UpdateExamInput } from "../exams/exam.types.js";
import type { Grade, GradeId, GradesByCourseQuery, GradesBySemesterQuery, RecordGradeInput, UpdateGradeInput } from "../grades/grade.types.js";
import type { CreateEducationGoalInput, EducationGoal, EducationGoalId, EducationGoalListQuery, UpdateEducationGoalInput } from "../goals/education-goal.types.js";
import type { CreateInstitutionInput, Institution, InstitutionId, InstitutionListQuery, UpdateInstitutionInput } from "../institutions/institution.types.js";
import type { AcademicProgram, CreateProgramInput, ProgramId, ProgramListQuery, UpdateProgramInput } from "../programs/program.types.js";
import type { CreateResourceInput, LearningResource, ResourceId, ResourcesByCourseQuery, UpdateResourceInput } from "../resources/resource.types.js";
import type { CreateScheduleEntryInput, ScheduleEntry, ScheduleEntryId, ScheduleEntryListQuery, UpdateScheduleEntryInput } from "../schedules/schedule.types.js";
import type { CreateSemesterInput, Semester, SemesterId, SemesterListQuery, UpdateSemesterInput } from "../semesters/semester.types.js";
import type { ScheduleStudySessionInput, StudySession, StudySessionId, StudySessionListQuery, StudySessionsByCourseQuery, UpdateStudySessionInput } from "../study-sessions/study-session.types.js";
import type { CourseTopic, CreateTopicInput, TopicId, TopicsByCourseQuery, UpdateTopicInput } from "../topics/topic.types.js";

export type ContextualQuery<TQuery extends { readonly ownerId: string }> = Omit<TQuery, "ownerId">;

export type UpcomingDeadlineKind = "assignment" | "exam" | "schedule";

export interface UpcomingDeadline {
  readonly kind: UpcomingDeadlineKind;
  readonly id: string;
  readonly courseId?: CourseId;
  readonly title: string;
  readonly dueAt: IsoDateTimeString;
}

export interface UpcomingDeadlinesQuery {
  readonly startsAt: IsoDateTimeString;
  readonly endsAt: IsoDateTimeString;
  readonly limit?: number;
}

export interface EducationOverview {
  readonly currentProgramId?: ProgramId;
  readonly currentSemesterId?: SemesterId;
  readonly activeCourseCount: number;
  readonly upcomingAssignmentCount: number;
  readonly upcomingExamCount: number;
}

export interface CurrentSemesterSummary {
  readonly semester: Semester;
  readonly courses: readonly Course[];
  readonly completedCourseCount: number;
}

export interface CurrentSemesterSummaryQuery {
  readonly programId?: ProgramId;
}

export interface ProgressDimension {
  readonly completedCount: number;
  readonly totalCount: number;
  readonly exactPercentage?: string;
}

export interface CourseProgress {
  readonly courseId: CourseId;
  readonly topics: ProgressDimension;
  readonly assignments: ProgressDimension;
}

export interface StudyTimeSummary {
  readonly range: DateRange;
  readonly courseId?: CourseId;
  readonly totalMinutes: number;
  readonly sessionCount: number;
  readonly omittedSessionCount: number;
}

export interface StudyTimeSummaryQuery {
  readonly range: DateRange;
  readonly courseId?: CourseId;
}

export interface CourseGradeSummary {
  readonly courseId: CourseId;
  readonly weightedGrade?: WeightedGradeCalculationResult;
}

export interface AcademicPerformanceSummary {
  readonly semesterId?: SemesterId;
  readonly courseGrades: readonly CourseGradeSummary[];
  readonly semesterGpa?: GpaCalculationResult;
  readonly cumulativeGpa?: CgpaCalculationResult;
  readonly missingGradePointCourseIds: readonly CourseId[];
}

export interface AcademicPerformanceSummaryQuery {
  readonly semesterId?: SemesterId;
  readonly gradePointScale: string;
}

export interface CourseAttendanceSummary {
  readonly courseId: CourseId;
  readonly calculation: AttendancePercentageCalculationResult;
}

export interface EducationService {
  createInstitution(context: EducationOperationContext, input: OwnerScopedInput<CreateInstitutionInput>): Promise<Institution>;
  updateInstitution(context: EducationOperationContext, input: UpdateInstitutionInput): Promise<Institution>;
  archiveInstitution(context: EducationOperationContext, id: InstitutionId): Promise<Institution>;
  getInstitution(context: EducationOperationContext, id: InstitutionId): Promise<Institution | null>;
  listInstitutions(context: EducationOperationContext, query?: ContextualQuery<InstitutionListQuery>): Promise<PageResult<Institution>>;

  createProgram(context: EducationOperationContext, input: OwnerScopedInput<CreateProgramInput>): Promise<AcademicProgram>;
  updateProgram(context: EducationOperationContext, input: UpdateProgramInput): Promise<AcademicProgram>;
  archiveProgram(context: EducationOperationContext, id: ProgramId): Promise<AcademicProgram>;
  getProgram(context: EducationOperationContext, id: ProgramId): Promise<AcademicProgram | null>;
  listPrograms(context: EducationOperationContext, query?: ContextualQuery<ProgramListQuery>): Promise<PageResult<AcademicProgram>>;

  createSemester(context: EducationOperationContext, input: OwnerScopedInput<CreateSemesterInput>): Promise<Semester>;
  updateSemester(context: EducationOperationContext, input: UpdateSemesterInput): Promise<Semester>;
  activateSemester(context: EducationOperationContext, id: SemesterId): Promise<Semester>;
  completeSemester(context: EducationOperationContext, id: SemesterId): Promise<Semester>;
  getSemester(context: EducationOperationContext, id: SemesterId): Promise<Semester | null>;
  listSemesters(context: EducationOperationContext, query?: ContextualQuery<SemesterListQuery>): Promise<PageResult<Semester>>;

  createCourse(context: EducationOperationContext, input: OwnerScopedInput<CreateCourseInput>): Promise<Course>;
  updateCourse(context: EducationOperationContext, input: UpdateCourseInput): Promise<Course>;
  archiveCourse(context: EducationOperationContext, id: CourseId): Promise<Course>;
  getCourse(context: EducationOperationContext, id: CourseId): Promise<Course | null>;
  listCourses(context: EducationOperationContext, query?: ContextualQuery<CourseListQuery>): Promise<PageResult<Course>>;
  listCoursesBySemester(context: EducationOperationContext, query: ContextualQuery<CoursesBySemesterQuery>): Promise<PageResult<Course>>;

  createTopic(context: EducationOperationContext, input: OwnerScopedInput<CreateTopicInput>): Promise<CourseTopic>;
  updateTopic(context: EducationOperationContext, input: UpdateTopicInput): Promise<CourseTopic>;
  markTopicComplete(context: EducationOperationContext, id: TopicId): Promise<CourseTopic>;
  getTopic(context: EducationOperationContext, id: TopicId): Promise<CourseTopic | null>;
  listTopicsByCourse(context: EducationOperationContext, query: ContextualQuery<TopicsByCourseQuery>): Promise<PageResult<CourseTopic>>;

  createAssignment(context: EducationOperationContext, input: OwnerScopedInput<CreateAssignmentInput>): Promise<Assignment>;
  updateAssignment(context: EducationOperationContext, input: UpdateAssignmentInput): Promise<Assignment>;
  submitAssignment(context: EducationOperationContext, id: AssignmentId): Promise<Assignment>;
  markAssignmentComplete(context: EducationOperationContext, id: AssignmentId): Promise<Assignment>;
  getAssignment(context: EducationOperationContext, id: AssignmentId): Promise<Assignment | null>;
  listAssignments(context: EducationOperationContext, query?: ContextualQuery<AssignmentListQuery>): Promise<PageResult<Assignment>>;
  getUpcomingAssignments(context: EducationOperationContext, query?: ContextualQuery<UpcomingAssignmentsQuery>): Promise<PageResult<Assignment>>;

  createExam(context: EducationOperationContext, input: OwnerScopedInput<CreateExamInput>): Promise<Exam>;
  updateExam(context: EducationOperationContext, input: UpdateExamInput): Promise<Exam>;
  completeExam(context: EducationOperationContext, id: ExamId): Promise<Exam>;
  getExam(context: EducationOperationContext, id: ExamId): Promise<Exam | null>;
  listExams(context: EducationOperationContext, query?: ContextualQuery<ExamListQuery>): Promise<PageResult<Exam>>;
  getUpcomingExams(context: EducationOperationContext, query?: ContextualQuery<UpcomingExamsQuery>): Promise<PageResult<Exam>>;

  recordGrade(context: EducationOperationContext, input: OwnerScopedInput<RecordGradeInput>): Promise<Grade>;
  updateGrade(context: EducationOperationContext, input: UpdateGradeInput): Promise<Grade>;
  deleteGrade(context: EducationOperationContext, id: GradeId): Promise<void>;
  getGrade(context: EducationOperationContext, id: GradeId): Promise<Grade | null>;
  listGradesByCourse(context: EducationOperationContext, query: ContextualQuery<GradesByCourseQuery>): Promise<PageResult<Grade>>;
  listGradesBySemester(context: EducationOperationContext, query: ContextualQuery<GradesBySemesterQuery>): Promise<PageResult<Grade>>;

  recordAttendance(context: EducationOperationContext, input: OwnerScopedInput<RecordAttendanceInput>): Promise<AttendanceRecord>;
  updateAttendance(context: EducationOperationContext, input: UpdateAttendanceInput): Promise<AttendanceRecord>;
  deleteAttendance(context: EducationOperationContext, id: AttendanceRecordId): Promise<void>;
  listAttendanceByCourse(context: EducationOperationContext, query: ContextualQuery<AttendanceByCourseQuery>): Promise<PageResult<AttendanceRecord>>;
  getCourseAttendanceSummary(context: EducationOperationContext, courseId: CourseId, excusedPolicy: ExcusedAttendancePolicy): Promise<CourseAttendanceSummary>;

  scheduleStudySession(context: EducationOperationContext, input: OwnerScopedInput<ScheduleStudySessionInput>): Promise<StudySession>;
  startStudySession(context: EducationOperationContext, id: StudySessionId): Promise<StudySession>;
  completeStudySession(context: EducationOperationContext, id: StudySessionId): Promise<StudySession>;
  cancelStudySession(context: EducationOperationContext, id: StudySessionId): Promise<StudySession>;
  getStudySession(context: EducationOperationContext, id: StudySessionId): Promise<StudySession | null>;
  listStudySessions(context: EducationOperationContext, query?: ContextualQuery<StudySessionListQuery>): Promise<PageResult<StudySession>>;
  listStudySessionsByCourse(context: EducationOperationContext, query: ContextualQuery<StudySessionsByCourseQuery>): Promise<PageResult<StudySession>>;

  createScheduleEntry(context: EducationOperationContext, input: OwnerScopedInput<CreateScheduleEntryInput>): Promise<ScheduleEntry>;
  updateScheduleEntry(context: EducationOperationContext, input: UpdateScheduleEntryInput): Promise<ScheduleEntry>;
  deleteScheduleEntry(context: EducationOperationContext, id: ScheduleEntryId): Promise<void>;
  getScheduleEntry(context: EducationOperationContext, id: ScheduleEntryId): Promise<ScheduleEntry | null>;
  listScheduleEntries(context: EducationOperationContext, query?: ContextualQuery<ScheduleEntryListQuery>): Promise<PageResult<ScheduleEntry>>;

  createResource(context: EducationOperationContext, input: OwnerScopedInput<CreateResourceInput>): Promise<LearningResource>;
  updateResource(context: EducationOperationContext, input: UpdateResourceInput): Promise<LearningResource>;
  archiveResource(context: EducationOperationContext, id: ResourceId): Promise<LearningResource>;
  getResource(context: EducationOperationContext, id: ResourceId): Promise<LearningResource | null>;
  listResourcesByCourse(context: EducationOperationContext, query: ContextualQuery<ResourcesByCourseQuery>): Promise<PageResult<LearningResource>>;

  createCertificate(context: EducationOperationContext, input: OwnerScopedInput<CreateCertificateInput>): Promise<Certificate>;
  updateCertificate(context: EducationOperationContext, input: UpdateCertificateInput): Promise<Certificate>;
  deleteCertificate(context: EducationOperationContext, id: CertificateId): Promise<void>;
  getCertificate(context: EducationOperationContext, id: CertificateId): Promise<Certificate | null>;
  listCertificates(context: EducationOperationContext, query?: ContextualQuery<CertificateListQuery>): Promise<PageResult<Certificate>>;

  createEducationGoal(context: EducationOperationContext, input: OwnerScopedInput<CreateEducationGoalInput>): Promise<EducationGoal>;
  updateEducationGoal(context: EducationOperationContext, input: UpdateEducationGoalInput): Promise<EducationGoal>;
  completeEducationGoal(context: EducationOperationContext, id: EducationGoalId): Promise<EducationGoal>;
  archiveEducationGoal(context: EducationOperationContext, id: EducationGoalId): Promise<EducationGoal>;
  getEducationGoal(context: EducationOperationContext, id: EducationGoalId): Promise<EducationGoal | null>;
  listEducationGoals(context: EducationOperationContext, query?: ContextualQuery<EducationGoalListQuery>): Promise<PageResult<EducationGoal>>;

  getEducationOverview(context: EducationOperationContext): Promise<EducationOverview>;
  getUpcomingDeadlines(context: EducationOperationContext, query: UpcomingDeadlinesQuery): Promise<readonly UpcomingDeadline[]>;
  getCurrentSemesterSummary(context: EducationOperationContext, query?: CurrentSemesterSummaryQuery): Promise<CurrentSemesterSummary | null>;
  getCourseProgress(context: EducationOperationContext, courseId: CourseId): Promise<CourseProgress>;
  getStudyTimeSummary(context: EducationOperationContext, query: StudyTimeSummaryQuery): Promise<StudyTimeSummary>;
  getAcademicPerformanceSummary(context: EducationOperationContext, query: AcademicPerformanceSummaryQuery): Promise<AcademicPerformanceSummary>;
}
