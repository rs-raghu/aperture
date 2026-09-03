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

import { EntityCollection } from "./entity-collection.js";

export class EducationMemoryStore {
  public readonly institutions: EntityCollection<Institution>;
  public readonly programs: EntityCollection<AcademicProgram>;
  public readonly semesters: EntityCollection<Semester>;
  public readonly courses: EntityCollection<Course>;
  public readonly topics: EntityCollection<CourseTopic>;
  public readonly assignments: EntityCollection<Assignment>;
  public readonly exams: EntityCollection<Exam>;
  public readonly grades: EntityCollection<Grade>;
  public readonly attendance: EntityCollection<AttendanceRecord>;
  public readonly studySessions: EntityCollection<StudySession>;
  public readonly schedules: EntityCollection<ScheduleEntry>;
  public readonly resources: EntityCollection<LearningResource>;
  public readonly certificates: EntityCollection<Certificate>;
  public readonly goals: EntityCollection<EducationGoal>;

  public constructor(cloneValues: boolean) {
    this.institutions = new EntityCollection(cloneValues);
    this.programs = new EntityCollection(cloneValues);
    this.semesters = new EntityCollection(cloneValues);
    this.courses = new EntityCollection(cloneValues);
    this.topics = new EntityCollection(cloneValues);
    this.assignments = new EntityCollection(cloneValues);
    this.exams = new EntityCollection(cloneValues);
    this.grades = new EntityCollection(cloneValues);
    this.attendance = new EntityCollection(cloneValues);
    this.studySessions = new EntityCollection(cloneValues);
    this.schedules = new EntityCollection(cloneValues);
    this.resources = new EntityCollection(cloneValues);
    this.certificates = new EntityCollection(cloneValues);
    this.goals = new EntityCollection(cloneValues);
  }
}
