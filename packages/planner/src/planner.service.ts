import type { PlannerRepository } from "./planner.repository.js";
import {
  plannerDateSchema, plannerItemSchema, plannerPlanSchema,
  type CreatePlannerItemInput, type CreatePlannerPlanInput, type DailyPlan, type PlannerClock,
  type PlannerIdGenerator, type PlannerItem, type PlannerItemQuery, type PlannerOperationContext,
  type PlannerPlan, type PlannerPlanQuery, type ScheduledPlannerItem, type UpdatePlannerItemInput,
  type UpdatePlannerPlanInput, type WeeklyPlan,
} from "./planner.types.js";

export interface PlannerServiceDependencies {
  readonly repository: PlannerRepository;
  readonly clock: PlannerClock;
  readonly idGenerator: PlannerIdGenerator;
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`); value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function dayDifference(from: string, to: string): number {
  return Math.floor((Date.parse(`${to}T00:00:00.000Z`) - Date.parse(`${from}T00:00:00.000Z`)) / 86_400_000);
}

function seedDate(item: PlannerItem): string | undefined { return item.scheduledFor ?? item.startsAt?.slice(0, 10) ?? item.dueAt?.slice(0, 10); }

export function plannerItemOccursOn(item: PlannerItem, date: string): boolean {
  const seed = seedDate(item);
  if (seed === undefined || date < seed) return false;
  const recurrence = item.recurrence;
  if (recurrence === undefined) return date === seed;
  if (recurrence.endsOn !== undefined && date > recurrence.endsOn) return false;
  const elapsed = dayDifference(seed, date);
  if (recurrence.frequency === "daily") return elapsed % recurrence.interval === 0;
  if (recurrence.frequency === "weekly") {
    const week = Math.floor(elapsed / 7);
    const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    const days = recurrence.daysOfWeek ?? [new Date(`${seed}T00:00:00.000Z`).getUTCDay()];
    return week % recurrence.interval === 0 && days.includes(weekday);
  }
  const seedValue = new Date(`${seed}T00:00:00.000Z`);
  const dateValue = new Date(`${date}T00:00:00.000Z`);
  const months = (dateValue.getUTCFullYear() - seedValue.getUTCFullYear()) * 12 + dateValue.getUTCMonth() - seedValue.getUTCMonth();
  return months % recurrence.interval === 0 && dateValue.getUTCDate() === seedValue.getUTCDate();
}

function isOverdue(item: PlannerItem, date: string): boolean {
  return item.dueAt !== undefined && item.dueAt.slice(0, 10) < date && !["completed", "cancelled", "archived"].includes(item.status);
}

function scheduled(item: PlannerItem, date: string): ScheduledPlannerItem {
  return Object.freeze({ item, occurrenceDate: date, overdue: isOverdue(item, date) });
}

function validateOwner(context: PlannerOperationContext): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(context.ownerId)) throw new Error("Planner owner ID must be a UUID.");
}

export function createPlannerService({ repository, clock, idGenerator }: PlannerServiceDependencies) {
  const listAllItems = async (context: PlannerOperationContext): Promise<readonly PlannerItem[]> => {
    validateOwner(context); return (await repository.items.findMany({ ownerId: context.ownerId, limit: 100 })).items;
  };
  const dailyFrom = (items: readonly PlannerItem[], date: string): DailyPlan => {
    const active = items.filter((item) => !["cancelled", "archived"].includes(item.status));
    const occurrence = active.filter((item) => plannerItemOccursOn(item, date)).map((item) => scheduled(item, date));
    return Object.freeze({
      date,
      scheduled: occurrence.filter(({ item }) => item.status !== "completed"),
      completed: occurrence.filter(({ item }) => item.status === "completed"),
      overdue: active.filter((item) => isOverdue(item, date)).map((item) => scheduled(item, date)),
    });
  };
  return Object.freeze({
    async createPlan(context: PlannerOperationContext, input: CreatePlannerPlanInput): Promise<PlannerPlan> {
      validateOwner(context); const now = clock.now();
      return repository.plans.create(plannerPlanSchema.parse({ ...input, id: idGenerator.generate(), ownerId: context.ownerId, status: input.status ?? "active", createdAt: now, updatedAt: now }));
    },
    async updatePlan(context: PlannerOperationContext, id: string, input: UpdatePlannerPlanInput): Promise<PlannerPlan> {
      validateOwner(context); const current = await repository.plans.findById(id, context.ownerId);
      if (current === null) throw new Error("Planner plan was not found.");
      return repository.plans.update(plannerPlanSchema.parse({ ...current, ...input, updatedAt: clock.now() }));
    },
    async listPlans(context: PlannerOperationContext, query: Omit<PlannerPlanQuery, "ownerId"> = {}) {
      validateOwner(context); return repository.plans.findMany({ ...query, ownerId: context.ownerId });
    },
    async createItem(context: PlannerOperationContext, input: CreatePlannerItemInput): Promise<PlannerItem> {
      validateOwner(context); const now = clock.now();
      const status = input.status ?? "planned";
      return repository.items.create(plannerItemSchema.parse({ ...input, id: idGenerator.generate(), ownerId: context.ownerId, priority: input.priority ?? 2, status, completedAt: status === "completed" ? now : undefined, createdAt: now, updatedAt: now }));
    },
    async updateItem(context: PlannerOperationContext, id: string, input: UpdatePlannerItemInput): Promise<PlannerItem> {
      validateOwner(context); const current = await repository.items.findById(id, context.ownerId);
      if (current === null) throw new Error("Planner item was not found.");
      const status = input.status ?? current.status;
      return repository.items.update(plannerItemSchema.parse({ ...current, ...input, status, completedAt: status === "completed" ? current.completedAt ?? clock.now() : undefined, updatedAt: clock.now() }));
    },
    async deleteItem(context: PlannerOperationContext, id: string): Promise<void> { validateOwner(context); await repository.items.delete(id, context.ownerId); },
    async completeItem(context: PlannerOperationContext, id: string): Promise<PlannerItem> { return this.updateItem(context, id, { status: "completed" }); },
    async reopenItem(context: PlannerOperationContext, id: string): Promise<PlannerItem> { return this.updateItem(context, id, { status: "planned" }); },
    async listItems(context: PlannerOperationContext, query: Omit<PlannerItemQuery, "ownerId"> = {}) {
      validateOwner(context); return repository.items.findMany({ ...query, ownerId: context.ownerId });
    },
    async getDailyPlan(context: PlannerOperationContext, date: string): Promise<DailyPlan> {
      const requestedDate = plannerDateSchema.parse(date);
      return dailyFrom(await listAllItems(context), requestedDate);
    },
    async getWeeklyPlan(context: PlannerOperationContext, date: string, weekStartsOn: "monday" | "sunday" = "monday"): Promise<WeeklyPlan> {
      const requestedDate = plannerDateSchema.parse(date);
      const value = new Date(`${requestedDate}T00:00:00.000Z`);
      const weekday = value.getUTCDay();
      const offset = weekStartsOn === "sunday" ? weekday : (weekday + 6) % 7;
      const startsOn = addDays(requestedDate, -offset); const items = await listAllItems(context);
      const days = Array.from({ length: 7 }, (_, index) => dailyFrom(items, addDays(startsOn, index)));
      return Object.freeze({ startsOn, endsOn: addDays(startsOn, 6), days });
    },
  });
}

export type PlannerService = ReturnType<typeof createPlannerService>;
