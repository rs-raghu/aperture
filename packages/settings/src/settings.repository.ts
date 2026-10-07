import type { IntegrationStatus, UserSettings } from "./settings.types.js";

export interface SettingsRepository {
  findPreferences(ownerId: string): Promise<UserSettings | null>;
  createPreferences(settings: UserSettings): Promise<UserSettings>;
  updatePreferences(settings: UserSettings): Promise<UserSettings>;
  deletePreferences(ownerId: string): Promise<void>;
  listIntegrationStatuses(ownerId: string): Promise<readonly IntegrationStatus[]>;
  createIntegrationStatus(status: IntegrationStatus): Promise<IntegrationStatus>;
  deleteIntegrationStatuses(ownerId: string): Promise<void>;
}
