import type { EntityMetadata } from "../health.types.js";

export type ExerciseId = string;
export type ExerciseCategory = "strength" | "cardio" | "mobility" | "balance" | "other";
export type ExerciseStatus = "active" | "archived";

export interface Exercise extends EntityMetadata {
  readonly id: ExerciseId;
  readonly name: string;
  readonly category: ExerciseCategory;
  readonly status: ExerciseStatus;
}
