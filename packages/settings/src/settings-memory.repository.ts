import type { SettingsRepository } from "./settings.repository.js";
import type { IntegrationStatus, UserSettings } from "./settings.types.js";

function clone<T>(value: T): T { return structuredClone(value); }

export function createSettingsMemoryRepository(initialIntegrations: readonly IntegrationStatus[] = []): SettingsRepository {
  const preferences = new Map<string, UserSettings>();
  const integrations = initialIntegrations.map(clone);
  return Object.freeze({
    async findPreferences(ownerId: string) { const value = preferences.get(ownerId); return value === undefined ? null : clone(value); },
    async createPreferences(settings: UserSettings) {
      if (preferences.has(settings.ownerId)) throw new Error("Settings already exist for this owner.");
      preferences.set(settings.ownerId, clone(settings)); return clone(settings);
    },
    async updatePreferences(settings: UserSettings) {
      const current = preferences.get(settings.ownerId);
      if (current === undefined || current.id !== settings.id) throw new Error("Settings were not found for this owner.");
      if (current.createdAt !== settings.createdAt) throw new Error("Settings identity is immutable.");
      preferences.set(settings.ownerId, clone(settings)); return clone(settings);
    },
    async listIntegrationStatuses(ownerId: string) {
      return integrations.filter((item) => item.ownerId === ownerId).sort((left, right) => left.integrationId.localeCompare(right.integrationId)).map(clone);
    },
  });
}
