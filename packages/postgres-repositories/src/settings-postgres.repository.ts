import {
  integrationStatusSchema, userSettingsSchema,
  type IntegrationStatus, type SettingsRepository, type UserSettings,
} from "@aperture/settings";
import type { SqlExecutor } from "./postgres.types.js";
import { PostgresCollection, type RuntimeSchema } from "./store/postgres-collection.js";

export function createSettingsPostgresRepository(database: SqlExecutor): SettingsRepository {
  const preferences = new PostgresCollection<UserSettings>(database, {
    schema: "platform", table: "user_preferences", entitySchema: userSettingsSchema as RuntimeSchema<UserSettings>,
    project: (settings) => ({
      locale: settings.locale, time_zone: settings.timeZone, currency: settings.currency, date_format: settings.dateFormat,
      week_start_day: settings.weekStartDay, measurement_system: settings.units.measurementSystem, theme: settings.theme,
      financial_year_start_month: settings.fiscalYear.startMonth, financial_year_start_day: settings.fiscalYear.startDay,
      gpa_scale: settings.gpaScale, unit_preferences: JSON.stringify(settings.units),
      calculator_defaults: JSON.stringify(settings.calculatorDefaults), feature_enablement: JSON.stringify(settings.featureEnablement),
      dashboard_widgets: JSON.stringify(settings.dashboardWidgets), privacy_controls: JSON.stringify(settings.privacy),
      platform_preferences: JSON.stringify(settings.platform),
    }),
  });
  const integrations = new PostgresCollection<IntegrationStatus>(database, {
    schema: "platform", table: "integration_connections", entitySchema: integrationStatusSchema as RuntimeSchema<IntegrationStatus>,
    project: (integration) => ({
      integration_id: integration.integrationId, status: integration.status, connected_at: integration.connectedAt ?? null,
      last_synchronized_at: integration.lastSynchronizedAt ?? null, last_error_code: integration.lastErrorCode ?? null,
    }),
  });
  return Object.freeze({
    findPreferences: async (ownerId: string) => (await preferences.findMany({ ownerId, limit: 1 }, () => true, (left, right) => left.id.localeCompare(right.id))).items[0] ?? null,
    createPreferences: (settings: UserSettings) => preferences.create(settings),
    updatePreferences: (settings: UserSettings) => preferences.update(settings),
    deletePreferences: async (ownerId: string) => {
      const current = (await preferences.findMany({ ownerId, limit: 1 }, () => true, (left, right) => left.id.localeCompare(right.id))).items[0];
      if (current !== undefined) await preferences.delete(current.id, ownerId);
    },
    listIntegrationStatuses: async (ownerId: string) => (await integrations.findMany({ ownerId }, () => true, (left, right) => left.integrationId.localeCompare(right.integrationId))).items,
    createIntegrationStatus: (status: IntegrationStatus) => integrations.create(status),
    deleteIntegrationStatuses: async (ownerId: string) => {
      const current = (await integrations.findMany({ ownerId }, () => true, (left, right) => left.integrationId.localeCompare(right.integrationId))).items;
      for (const status of current) await integrations.delete(status.id, ownerId);
    },
  });
}
