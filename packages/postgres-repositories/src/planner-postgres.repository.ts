import {
  plannerItemLinkSchema, plannerItemSchema, plannerPlanSchema,
  type PlannerCrudRepository, type PlannerItem, type PlannerItemLink, type PlannerItemLinkQuery,
  type PlannerItemQuery, type PlannerPlan, type PlannerPlanQuery, type PlannerRepository,
} from "@aperture/planner";

import type { SqlExecutor } from "./postgres.types.js";
import { PostgresCollection, type RuntimeSchema } from "./store/postgres-collection.js";

function optionalText(left?: string, right?: string): number {
  if (left === undefined) return right === undefined ? 0 : 1;
  if (right === undefined) return -1;
  return left.localeCompare(right);
}

function collection<TEntity extends { readonly id: string; readonly ownerId: string; readonly createdAt: string; readonly updatedAt: string }, TQuery extends { readonly ownerId: string }>(
  durable: PostgresCollection<TEntity>,
  matches: (entity: TEntity, query: TQuery) => boolean,
  compare: (left: TEntity, right: TEntity) => number,
): PlannerCrudRepository<TEntity, TQuery> {
  const repository: PlannerCrudRepository<TEntity, TQuery> = {
    create: (entity) => durable.create(entity),
    update: (entity) => durable.update(entity),
    delete: (id, ownerId) => durable.delete(id, ownerId),
    findById: (id, ownerId) => durable.findById(id, ownerId),
    findMany: (query) => durable.findMany(query, matches, compare),
  };
  return Object.freeze(repository);
}

export function createPlannerPostgresRepository(database: SqlExecutor): PlannerRepository {
  const plans = new PostgresCollection<PlannerPlan>(database, {
    schema: "planner", table: "plans", entitySchema: plannerPlanSchema as RuntimeSchema<PlannerPlan>,
    project: (plan) => ({ title: plan.title, plan_type: plan.planType, starts_on: plan.startsOn ?? null, ends_on: plan.endsOn ?? null, status: plan.status }),
  });
  const items = new PostgresCollection<PlannerItem>(database, {
    schema: "planner", table: "items", entitySchema: plannerItemSchema as RuntimeSchema<PlannerItem>,
    project: (item) => ({
      plan_id: item.planId ?? null, title: item.title, description: item.description ?? null, item_type: item.itemType,
      status: item.status, scheduled_for: item.scheduledFor ?? null, starts_at: item.startsAt ?? null, ends_at: item.endsAt ?? null,
      due_at: item.dueAt ?? null, priority: item.priority, recurrence_rule: item.recurrence === undefined ? null : JSON.stringify(item.recurrence),
      completed_at: item.completedAt ?? null,
    }),
  });
  const links = new PostgresCollection<PlannerItemLink>(database, {
    schema: "planner", table: "item_links", entitySchema: plannerItemLinkSchema as RuntimeSchema<PlannerItemLink>,
    project: (link) => ({ planner_item_id: link.plannerItemId, target_scope: link.targetScope, target_id: link.targetId }),
  });
  return Object.freeze({
    plans: collection<PlannerPlan, PlannerPlanQuery>(plans,
      (plan, query) => (query.status === undefined || plan.status === query.status)
        && (query.planType === undefined || plan.planType === query.planType)
        && (query.intersectsFrom === undefined || plan.endsOn === undefined || plan.endsOn >= query.intersectsFrom)
        && (query.intersectsTo === undefined || plan.startsOn === undefined || plan.startsOn <= query.intersectsTo),
      (left, right) => optionalText(left.startsOn, right.startsOn)),
    items: collection<PlannerItem, PlannerItemQuery>(items,
      (item, query) => (query.planId === undefined || item.planId === query.planId)
        && (query.itemType === undefined || item.itemType === query.itemType)
        && (query.status === undefined || item.status === query.status)
        && (query.priority === undefined || item.priority === query.priority)
        && (query.scheduledFrom === undefined || (item.scheduledFor !== undefined && item.scheduledFor >= query.scheduledFrom))
        && (query.scheduledTo === undefined || (item.scheduledFor !== undefined && item.scheduledFor <= query.scheduledTo))
        && (query.dueBefore === undefined || (item.dueAt !== undefined && item.dueAt <= query.dueBefore)),
      (left, right) => optionalText(left.scheduledFor ?? left.startsAt ?? left.dueAt, right.scheduledFor ?? right.startsAt ?? right.dueAt) || right.priority - left.priority),
    itemLinks: collection<PlannerItemLink, PlannerItemLinkQuery>(links,
      (link, query) => (query.plannerItemId === undefined || link.plannerItemId === query.plannerItemId)
        && (query.targetScope === undefined || link.targetScope === query.targetScope)
        && (query.targetId === undefined || link.targetId === query.targetId),
      (left, right) => left.targetScope.localeCompare(right.targetScope) || left.targetId.localeCompare(right.targetId)),
  });
}
