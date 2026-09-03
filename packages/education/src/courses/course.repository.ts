import type { CrudRepository } from "../repositories/repository.types.js";
import type { OwnerId } from "../education.types.js";
import type { SemesterId } from "../semesters/semester.types.js";
import type { Course, CourseId, CourseListQuery } from "./course.types.js";

export interface CourseRepository
  extends CrudRepository<Course, CourseId, CourseListQuery> {
  findByCode(ownerId: OwnerId, semesterId: SemesterId, code: string): Promise<Course | null>;
}
