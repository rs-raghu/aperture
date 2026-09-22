import { z } from "@aperture/validation";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;

function validDate(value: string): boolean {
  const [yearText, monthText, dayText] = value.split("-");
  const date = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)));
  return date.toISOString().slice(0, 10) === value;
}

export const plannerIdSchema = z.string().uuid();
export const plannerOwnerIdSchema = plannerIdSchema;
export const plannerDateSchema = z.string().regex(ISO_DATE).refine(validDate, "Expected a valid calendar date.");
export const plannerInstantSchema = z.string().regex(ISO_INSTANT).refine((value) => Number.isFinite(Date.parse(value)), "Expected a valid timestamp.");
export const plannerTitleSchema = z.string().trim().min(1).max(200);
export const plannerDescriptionSchema = z.string().trim().max(4000).optional();
export const plannerPlanStatuses = ["draft", "active", "completed", "archived"] as const;
export const plannerPlanStatusSchema = z.enum(plannerPlanStatuses);
export const plannerPlanTypes = ["day", "week", "custom"] as const;
export const plannerPlanTypeSchema = z.enum(plannerPlanTypes);
export const plannerItemTypes = ["task", "event", "reminder", "focus"] as const;
export const plannerItemTypeSchema = z.enum(plannerItemTypes);
export const plannerItemStatuses = ["planned", "in_progress", "completed", "cancelled", "archived"] as const;
export const plannerItemStatusSchema = z.enum(plannerItemStatuses);
export const plannerPrioritySchema = z.number().int().min(0).max(4);
export const plannerRecurrenceFrequencies = ["daily", "weekly", "monthly"] as const;
export const plannerRecurrenceFrequencySchema = z.enum(plannerRecurrenceFrequencies);
export const plannerTargetScopes = ["education", "health", "finance", "platform"] as const;
export const plannerTargetScopeSchema = z.enum(plannerTargetScopes);

export const plannerRecurrenceSchema = z.strictObject({
  frequency: plannerRecurrenceFrequencySchema,
  interval: z.number().int().min(1).max(365),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  endsOn: plannerDateSchema.optional(),
}).refine((value) => value.daysOfWeek === undefined || new Set(value.daysOfWeek).size === value.daysOfWeek.length, {
  message: "Recurrence weekdays must be unique.", path: ["daysOfWeek"],
});

const metadata = {
  id: plannerIdSchema,
  ownerId: plannerOwnerIdSchema,
  createdAt: plannerInstantSchema,
  updatedAt: plannerInstantSchema,
};

export const plannerPlanSchema = z.strictObject({
  ...metadata,
  title: plannerTitleSchema,
  planType: plannerPlanTypeSchema,
  startsOn: plannerDateSchema.optional(),
  endsOn: plannerDateSchema.optional(),
  status: plannerPlanStatusSchema,
}).refine((value) => value.startsOn === undefined || value.endsOn === undefined || value.startsOn <= value.endsOn, {
  message: "Plan end date cannot be earlier than its start date.", path: ["endsOn"],
});

export const plannerItemSchema = z.strictObject({
  ...metadata,
  planId: plannerIdSchema.optional(),
  title: plannerTitleSchema,
  description: plannerDescriptionSchema,
  itemType: plannerItemTypeSchema,
  status: plannerItemStatusSchema,
  scheduledFor: plannerDateSchema.optional(),
  startsAt: plannerInstantSchema.optional(),
  endsAt: plannerInstantSchema.optional(),
  dueAt: plannerInstantSchema.optional(),
  priority: plannerPrioritySchema,
  recurrence: plannerRecurrenceSchema.optional(),
  completedAt: plannerInstantSchema.optional(),
}).refine((value) => value.startsAt === undefined || value.endsAt === undefined || value.startsAt <= value.endsAt, {
  message: "Item end time cannot be earlier than its start time.", path: ["endsAt"],
}).refine((value) => value.status === "completed" ? value.completedAt !== undefined : value.completedAt === undefined, {
  message: "Completion time must match completed status.", path: ["completedAt"],
});

export const plannerItemLinkSchema = z.strictObject({
  ...metadata,
  plannerItemId: plannerIdSchema,
  targetScope: plannerTargetScopeSchema,
  targetId: plannerIdSchema,
});

export type PlannerPlanStatus = z.infer<typeof plannerPlanStatusSchema>;
export type PlannerPlanType = z.infer<typeof plannerPlanTypeSchema>;
export type PlannerItemType = z.infer<typeof plannerItemTypeSchema>;
export type PlannerItemStatus = z.infer<typeof plannerItemStatusSchema>;
export type PlannerRecurrence = z.infer<typeof plannerRecurrenceSchema>;
export type PlannerTargetScope = z.infer<typeof plannerTargetScopeSchema>;
export type PlannerPlan = z.infer<typeof plannerPlanSchema>;
export type PlannerItem = z.infer<typeof plannerItemSchema>;
export type PlannerItemLink = z.infer<typeof plannerItemLinkSchema>;

export interface PlannerPage<TEntity> {
  readonly items: readonly TEntity[];
  readonly nextCursor?: string;
}

export interface PlannerPageRequest {
  readonly ownerId: string;
  readonly cursor?: string;
  readonly limit?: number;
  readonly sortDirection?: "ascending" | "descending";
}

export interface PlannerPlanQuery extends PlannerPageRequest {
  readonly status?: PlannerPlanStatus;
  readonly planType?: PlannerPlanType;
  readonly intersectsFrom?: string;
  readonly intersectsTo?: string;
}

export interface PlannerItemQuery extends PlannerPageRequest {
  readonly planId?: string;
  readonly itemType?: PlannerItemType;
  readonly status?: PlannerItemStatus;
  readonly priority?: number;
  readonly scheduledFrom?: string;
  readonly scheduledTo?: string;
  readonly dueBefore?: string;
}

export interface PlannerItemLinkQuery extends PlannerPageRequest {
  readonly plannerItemId?: string;
  readonly targetScope?: PlannerTargetScope;
  readonly targetId?: string;
}

export interface CreatePlannerPlanInput {
  readonly title: string;
  readonly planType: PlannerPlanType;
  readonly startsOn?: string;
  readonly endsOn?: string;
  readonly status?: PlannerPlanStatus;
}

export type UpdatePlannerPlanInput = Partial<CreatePlannerPlanInput>;

export interface CreatePlannerItemInput {
  readonly planId?: string;
  readonly title: string;
  readonly description?: string;
  readonly itemType: PlannerItemType;
  readonly status?: PlannerItemStatus;
  readonly scheduledFor?: string;
  readonly startsAt?: string;
  readonly endsAt?: string;
  readonly dueAt?: string;
  readonly priority?: number;
  readonly recurrence?: PlannerRecurrence;
}

export type UpdatePlannerItemInput = Partial<CreatePlannerItemInput>;

export interface PlannerOperationContext { readonly ownerId: string; }
export interface PlannerClock { now(): string; }
export interface PlannerIdGenerator { generate(): string; }

export interface ScheduledPlannerItem {
  readonly item: PlannerItem;
  readonly occurrenceDate: string;
  readonly overdue: boolean;
}

export interface DailyPlan {
  readonly date: string;
  readonly scheduled: readonly ScheduledPlannerItem[];
  readonly overdue: readonly ScheduledPlannerItem[];
  readonly completed: readonly ScheduledPlannerItem[];
}

export interface WeeklyPlan {
  readonly startsOn: string;
  readonly endsOn: string;
  readonly days: readonly DailyPlan[];
}
