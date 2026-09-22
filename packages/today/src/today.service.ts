import type {
  TodayContributor, TodayDashboard, TodayQuickAction, TodayWidget, TodayWidgetDefinition,
} from "./today.types.js";

export interface TodayServiceConfiguration {
  readonly widgets: readonly TodayWidgetDefinition[];
  readonly contributors: readonly TodayContributor[];
  readonly quickActions: readonly TodayQuickAction[];
}

export function createTodayService(configuration: TodayServiceConfiguration) {
  const contributors = new Map(configuration.contributors.map((item) => [item.widgetId, item]));
  if (contributors.size !== configuration.contributors.length) throw new Error("Today contributor widget IDs must be unique.");
  return Object.freeze({
    async getDashboard(input: { readonly ownerId: string; readonly date: string; readonly enabledWidgetIds?: readonly string[] }): Promise<TodayDashboard> {
      const enabled = input.enabledWidgetIds === undefined ? undefined : new Set(input.enabledWidgetIds);
      const definitions = [...configuration.widgets]
        .filter((widget) => enabled === undefined ? widget.defaultEnabled : enabled.has(widget.id))
        .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
      const widgets = await Promise.all(definitions.map(async (definition): Promise<TodayWidget> => {
        const contributor = contributors.get(definition.id);
        if (contributor === undefined) return Object.freeze({ definition, state: "unavailable", items: [], message: "This contribution is not connected." });
        try {
          const items = [...await contributor.load(input)].sort((left, right) =>
            Number(Boolean(right.overdue)) - Number(Boolean(left.overdue))
            || (right.priority ?? 0) - (left.priority ?? 0)
            || (left.occursAt ?? "9999").localeCompare(right.occursAt ?? "9999")
            || left.title.localeCompare(right.title));
          return Object.freeze({ definition, state: "ready", items: Object.freeze(items) });
        } catch {
          return Object.freeze({ definition, state: "unavailable", items: [], message: "This contribution could not be loaded." });
        }
      }));
      const items = widgets.flatMap((widget) => widget.items);
      return Object.freeze({
        date: input.date,
        widgets: Object.freeze(widgets),
        quickActions: Object.freeze([...configuration.quickActions]),
        totalItems: items.length,
        overdueItems: items.filter(({ overdue }) => overdue).length,
      });
    },
  });
}

export type TodayService = ReturnType<typeof createTodayService>;
