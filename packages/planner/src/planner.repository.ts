import type {
  PlannerItem, PlannerItemLink, PlannerItemLinkQuery, PlannerItemQuery, PlannerPage,
  PlannerPlan, PlannerPlanQuery,
} from "./planner.types.js";

export interface PlannerCrudRepository<TEntity, TQuery> {
  create(entity: TEntity): Promise<TEntity>;
  update(entity: TEntity): Promise<TEntity>;
  delete(id: string, ownerId: string): Promise<void>;
  findById(id: string, ownerId: string): Promise<TEntity | null>;
  findMany(query: TQuery): Promise<PlannerPage<TEntity>>;
}

export interface PlannerRepository {
  readonly plans: PlannerCrudRepository<PlannerPlan, PlannerPlanQuery>;
  readonly items: PlannerCrudRepository<PlannerItem, PlannerItemQuery>;
  readonly itemLinks: PlannerCrudRepository<PlannerItemLink, PlannerItemLinkQuery>;
}
