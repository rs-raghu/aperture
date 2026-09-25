import { z } from "@aperture/validation";

const idSchema = z.string().uuid();
const instantSchema = z.string().datetime({ offset: true });
const booleanMapSchema = z.record(z.string().trim().min(1).max(120), z.boolean());
const calculatorValueSchema = z.union([z.string().max(500), z.number().finite(), z.boolean()]);

export const settingsThemeSchema = z.enum(["system", "light", "dark"]);
export const settingsDateFormatSchema = z.enum(["locale-default", "day-month-year", "month-day-year", "year-month-day"]);
export const settingsWeekStartSchema = z.enum(["monday", "sunday"]);
export const settingsMeasurementSystemSchema = z.enum(["metric", "imperial"]);
export const settingsTemperatureUnitSchema = z.enum(["celsius", "fahrenheit"]);
export const settingsDistanceUnitSchema = z.enum(["kilometres", "miles"]);
export const settingsMassUnitSchema = z.enum(["kilograms", "pounds"]);
export const settingsIntegrationStateSchema = z.enum(["available", "connecting", "connected", "disconnected", "error"]);

export const unitPreferencesSchema = z.strictObject({
  measurementSystem: settingsMeasurementSystemSchema,
  temperatureUnit: settingsTemperatureUnitSchema,
  distanceUnit: settingsDistanceUnitSchema,
  massUnit: settingsMassUnitSchema,
});

export const fiscalYearPreferenceSchema = z.strictObject({
  startMonth: z.number().int().min(1).max(12),
  startDay: z.number().int().min(1).max(31),
});

export const privacyControlsSchema = z.strictObject({
  usageAnalytics: z.boolean(),
  crashReports: z.boolean(),
  personalizedInsights: z.boolean(),
  integrationDataSharing: z.boolean(),
});

export const platformPreferencesSchema = z.strictObject({
  web: z.strictObject({ compactNavigation: z.boolean(), reduceMotion: z.boolean() }),
  mobile: z.strictObject({ haptics: z.boolean(), reduceMotion: z.boolean() }),
});

export const userSettingsSchema = z.strictObject({
  id: idSchema,
  ownerId: idSchema,
  createdAt: instantSchema,
  updatedAt: instantSchema,
  theme: settingsThemeSchema,
  locale: z.string().trim().min(2).max(35),
  timeZone: z.string().trim().min(1).max(100),
  currency: z.string().regex(/^[A-Z]{3}$/),
  dateFormat: settingsDateFormatSchema,
  units: unitPreferencesSchema,
  weekStartDay: settingsWeekStartSchema,
  fiscalYear: fiscalYearPreferenceSchema,
  gpaScale: z.number().positive().max(100),
  calculatorDefaults: z.record(z.string().trim().min(1).max(120), calculatorValueSchema),
  featureEnablement: booleanMapSchema,
  dashboardWidgets: booleanMapSchema,
  privacy: privacyControlsSchema,
  platform: platformPreferencesSchema,
});

export const integrationStatusSchema = z.strictObject({
  id: idSchema,
  ownerId: idSchema,
  createdAt: instantSchema,
  updatedAt: instantSchema,
  integrationId: z.string().trim().min(1).max(100),
  status: settingsIntegrationStateSchema,
  connectedAt: instantSchema.optional(),
  lastSynchronizedAt: instantSchema.optional(),
  lastErrorCode: z.string().trim().min(1).max(120).optional(),
});

export type SettingsTheme = z.infer<typeof settingsThemeSchema>;
export type SettingsDateFormat = z.infer<typeof settingsDateFormatSchema>;
export type SettingsWeekStart = z.infer<typeof settingsWeekStartSchema>;
export type SettingsMeasurementSystem = z.infer<typeof settingsMeasurementSystemSchema>;
export type UnitPreferences = z.infer<typeof unitPreferencesSchema>;
export type FiscalYearPreference = z.infer<typeof fiscalYearPreferenceSchema>;
export type PrivacyControls = z.infer<typeof privacyControlsSchema>;
export type PlatformPreferences = z.infer<typeof platformPreferencesSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type IntegrationStatus = z.infer<typeof integrationStatusSchema>;
export type CalculatorDefaultValue = z.infer<typeof calculatorValueSchema>;

export interface SettingsContext { readonly ownerId: string; }
export interface SettingsClock { now(): string; }
export interface SettingsIdGenerator { generate(): string; }

export interface UpdateSettingsInput {
  readonly theme?: SettingsTheme;
  readonly locale?: string;
  readonly timeZone?: string;
  readonly currency?: string;
  readonly dateFormat?: SettingsDateFormat;
  readonly units?: Partial<UnitPreferences>;
  readonly weekStartDay?: SettingsWeekStart;
  readonly fiscalYear?: Partial<FiscalYearPreference>;
  readonly gpaScale?: number;
  readonly calculatorDefaults?: Readonly<Record<string, CalculatorDefaultValue>>;
  readonly featureEnablement?: Readonly<Record<string, boolean>>;
  readonly dashboardWidgets?: Readonly<Record<string, boolean>>;
  readonly privacy?: Partial<PrivacyControls>;
}

export interface SettingsClientSnapshot {
  readonly preferences: UserSettings;
  readonly integrations: readonly IntegrationStatus[];
}

export const SAFE_SETTINGS_DEFAULTS = Object.freeze({
  theme: "system",
  locale: "en-IN",
  timeZone: "Asia/Kolkata",
  currency: "INR",
  dateFormat: "day-month-year",
  units: Object.freeze({ measurementSystem: "metric", temperatureUnit: "celsius", distanceUnit: "kilometres", massUnit: "kilograms" }),
  weekStartDay: "monday",
  fiscalYear: Object.freeze({ startMonth: 4, startDay: 1 }),
  gpaScale: 10,
  calculatorDefaults: Object.freeze({}),
  featureEnablement: Object.freeze({}),
  dashboardWidgets: Object.freeze({}),
  privacy: Object.freeze({ usageAnalytics: false, crashReports: false, personalizedInsights: false, integrationDataSharing: false }),
  platform: Object.freeze({
    web: Object.freeze({ compactNavigation: false, reduceMotion: false }),
    mobile: Object.freeze({ haptics: true, reduceMotion: false }),
  }),
} as const);
