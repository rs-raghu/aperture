import type { EducationRepository } from "@aperture/education";
import type { FinanceRepository } from "@aperture/finance/contracts";
import type { HealthRepository } from "@aperture/health";
import type { PlannerService } from "@aperture/planner";
import type { TodayContributor, TodayItem } from "./today.types.js";

function startOf(date: string): string { return `${date}T00:00:00.000Z`; }
function endOf(date: string): string { return `${date}T23:59:59.999Z`; }
function addDays(date: string, days: number): string {
  const value = new Date(startOf(date)); value.setUTCDate(value.getUTCDate() + days); return value.toISOString().slice(0, 10);
}

export interface StandardTodayRepositories {
  readonly education: EducationRepository;
  readonly health: HealthRepository;
  readonly finance: FinanceRepository;
}

export function createStandardTodayContributors(
  repositories: StandardTodayRepositories,
  planner: PlannerService,
): readonly TodayContributor[] {
  return Object.freeze([
    {
      widgetId: "planner.items",
      async load({ ownerId, date }) {
        const plan = await planner.getDailyPlan({ ownerId }, date);
        return [...plan.overdue, ...plan.scheduled].filter((entry, index, values) => values.findIndex(({ item }) => item.id === entry.item.id) === index).map(({ item, overdue }) => Object.freeze({
          id: `planner:${item.id}`, widgetId: "planner.items", sourceFeatureId: "planner", kind: item.itemType === "event" ? "event" : "task",
          title: item.title, ...(item.description === undefined ? {} : { detail: item.description }), occursAt: item.startsAt ?? item.dueAt ?? `${date}T00:00:00.000Z`, status: item.status,
          priority: item.priority, href: "/planner", overdue,
        } satisfies TodayItem));
      },
    },
    {
      widgetId: "education.deadlines",
      async load({ ownerId, date }) {
        const until = endOf(addDays(date, 7));
        const [assignments, exams] = await Promise.all([
          repositories.education.assignments.findMany({ ownerId, dueTo: until, limit: 100 }),
          repositories.education.exams.findMany({ ownerId, startsBefore: until, limit: 100 }),
        ]);
        return [
          ...assignments.items.filter((item) => item.dueAt !== undefined && !["completed", "cancelled"].includes(item.status)).map((item) => Object.freeze({
            id: `assignment:${item.id}`, widgetId: "education.deadlines", sourceFeatureId: "education", kind: "deadline" as const,
            title: item.title, detail: "Assignment", occursAt: item.dueAt!, status: item.status, priority: item.priority === "urgent" ? 4 : item.priority === "high" ? 3 : item.priority === "normal" ? 2 : 1,
            href: "/education/assignments", overdue: item.dueAt!.slice(0, 10) < date,
          })),
          ...exams.items.filter((item) => item.status === "scheduled" && item.scheduledStartsAt >= startOf(date)).map((item) => Object.freeze({
            id: `exam:${item.id}`, widgetId: "education.deadlines", sourceFeatureId: "education", kind: "deadline" as const,
            title: item.title, detail: `${item.examType} exam`, occursAt: item.scheduledStartsAt, status: item.status, priority: 3,
            href: "/education/exams",
          })),
        ];
      },
    },
    {
      widgetId: "education.study",
      async load({ ownerId, date }) {
        const sessions = await repositories.education.studySessions.findMany({ ownerId, startsAfter: startOf(date), startsBefore: endOf(date), limit: 100 });
        return sessions.items.filter((item) => !["completed", "cancelled"].includes(item.status)).map((item) => Object.freeze({
          id: `study:${item.id}`, widgetId: "education.study", sourceFeatureId: "education", kind: "study" as const,
          title: item.title, detail: `${item.plannedDurationMinutes ?? 0} planned minutes`, occursAt: item.plannedStartsAt, status: item.status,
          href: "/education/study-sessions",
        }));
      },
    },
    {
      widgetId: "health.plans",
      async load({ ownerId, date }) {
        const plans = await repositories.health.workoutPlans.findMany({ ownerId, status: "active", limit: 100 });
        return plans.items.filter((item) => (item.startsOn === undefined || item.startsOn <= date) && (item.endsOn === undefined || item.endsOn >= date)).map((item) => Object.freeze({
          id: `workout-plan:${item.id}`, widgetId: "health.plans", sourceFeatureId: "health", kind: "workout" as const,
          title: item.title, detail: item.endsOn ? `Active through ${item.endsOn}` : "Active workout plan", occursAt: startOf(date), status: item.status,
          href: "/health/workouts",
        }));
      },
    },
    {
      widgetId: "finance.reminders",
      async load({ ownerId, date }) {
        const recurring = await repositories.finance.recurringTransactions.findMany({ ownerId, status: "active", limit: 100 });
        return recurring.items.filter((item) => item.nextOccurrenceOn <= addDays(date, 7)).map((item) => Object.freeze({
          id: `recurring:${item.id}`, widgetId: "finance.reminders", sourceFeatureId: "finance", kind: "reminder" as const,
          title: item.description, detail: `${item.amount.currency} ${item.amount.amount}`, occursAt: startOf(item.nextOccurrenceOn), status: item.status,
          href: "/finance/transactions", overdue: item.nextOccurrenceOn < date,
        }));
      },
    },
  ]);
}
