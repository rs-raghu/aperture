export interface TodayWidgetDefinition {
  readonly id: string;
  readonly featureId: string;
  readonly featureName: string;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly defaultEnabled: boolean;
}

export type TodayItemKind = "task" | "event" | "deadline" | "study" | "workout" | "reminder";

export interface TodayItem {
  readonly id: string;
  readonly widgetId: string;
  readonly sourceFeatureId: string;
  readonly kind: TodayItemKind;
  readonly title: string;
  readonly detail?: string;
  readonly occursAt?: string;
  readonly status?: string;
  readonly priority?: number;
  readonly href: string;
  readonly overdue?: boolean;
}

export interface TodayContributionInput { readonly ownerId: string; readonly date: string; }
export interface TodayContributor {
  readonly widgetId: string;
  load(input: TodayContributionInput): Promise<readonly TodayItem[]>;
}

export interface TodayQuickAction { readonly id: string; readonly label: string; readonly href: string; readonly featureId: string; }
export interface TodayWidget {
  readonly definition: TodayWidgetDefinition;
  readonly state: "ready" | "unavailable";
  readonly items: readonly TodayItem[];
  readonly message?: string;
}
export interface TodayDashboard {
  readonly date: string;
  readonly widgets: readonly TodayWidget[];
  readonly quickActions: readonly TodayQuickAction[];
  readonly totalItems: number;
  readonly overdueItems: number;
}
