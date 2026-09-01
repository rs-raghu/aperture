import type { CrudRepository } from "../repositories/repository.types.js";
import type { CourseListQuery, CreateCourseInput, UpdateCourseInput } from "./course.contracts.js";
import type { Course, CourseId } from "./course.types.js";

export interface CourseRepository
  extends CrudRepository<Course, CourseId, CreateCourseInput, UpdateCourseInput, CourseListQuery> {
  archive(id: CourseId, ownerId: string): Promise<Course>;
}
