import type { SettingsRepository } from "./settings.repository.js";
import {
  SAFE_SETTINGS_DEFAULTS, integrationStatusSchema, userSettingsSchema,
  type PlatformPreferences, type SettingsClientSnapshot, type SettingsClock, type SettingsContext,
  type SettingsIdGenerator, type UpdateSettingsInput, type UserSettings,
} from "./settings.types.js";

export interface SettingsServiceDependencies {
  readonly repository: SettingsRepository;
  readonly clock: SettingsClock;
  readonly idGenerator: SettingsIdGenerator;
  readonly protectedFeatureIds?: readonly string[];
  readonly knownFeatureIds?: readonly string[];
  readonly knownWidgetIds?: readonly string[];
}

function validateOwner(context: SettingsContext): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(context.ownerId)) throw new Error("Settings owner ID must be a UUID.");
}

function assertKnown(values: Readonly<Record<string, boolean>> | undefined, known: ReadonlySet<string>, label: string): void {
  if (values === undefined || known.size === 0) return;
  const unknown = Object.keys(values).find((id) => !known.has(id));
  if (unknown !== undefined) throw new Error(`Unknown ${label}: ${unknown}.`);
}

export function createSettingsService(dependencies: SettingsServiceDependencies) {
  const protectedFeatures = new Set(dependencies.protectedFeatureIds ?? ["today", "settings"]);
  const knownFeatures = new Set(dependencies.knownFeatureIds ?? []);
  const knownWidgets = new Set(dependencies.knownWidgetIds ?? []);
  let mutationQueue: Promise<void> = Promise.resolve();
  const serialize = <T>(work: () => Promise<T>): Promise<T> => {
    const result = mutationQueue.then(work, work);
    mutationQueue = result.then(() => undefined, () => undefined);
    return result;
  };

  const ensure = async (context: SettingsContext): Promise<UserSettings> => {
    validateOwner(context);
    const existing = await dependencies.repository.findPreferences(context.ownerId);
    if (existing !== null) return userSettingsSchema.parse(existing);
    const now = dependencies.clock.now();
    const defaults = userSettingsSchema.parse({
      ...SAFE_SETTINGS_DEFAULTS,
      id: dependencies.idGenerator.generate(), ownerId: context.ownerId, createdAt: now, updatedAt: now,
    });
    try {
      return await dependencies.repository.createPreferences(defaults);
    } catch (error) {
      const raced = await dependencies.repository.findPreferences(context.ownerId);
      if (raced !== null) return userSettingsSchema.parse(raced);
      throw error;
    }
  };

  return Object.freeze({
    getSettings: ensure,
    async getClientSnapshot(context: SettingsContext): Promise<SettingsClientSnapshot> {
      const [preferences, integrations] = await Promise.all([ensure(context), dependencies.repository.listIntegrationStatuses(context.ownerId)]);
      return Object.freeze({ preferences, integrations: Object.freeze(integrations.map((item) => integrationStatusSchema.parse(item))) });
    },
    updateSettings(context: SettingsContext, input: UpdateSettingsInput): Promise<UserSettings> {
      return serialize(async () => {
        const current = await ensure(context);
        assertKnown(input.featureEnablement, knownFeatures, "feature ID");
        assertKnown(input.dashboardWidgets, knownWidgets, "widget ID");
        for (const featureId of protectedFeatures) {
          if (input.featureEnablement?.[featureId] === false) throw new Error(`${featureId} is a core feature and cannot be disabled.`);
        }
        const next = userSettingsSchema.parse({
          ...current,
          ...input,
          currency: input.currency?.toUpperCase() ?? current.currency,
          units: { ...current.units, ...input.units },
          fiscalYear: { ...current.fiscalYear, ...input.fiscalYear },
          calculatorDefaults: { ...current.calculatorDefaults, ...input.calculatorDefaults },
          featureEnablement: { ...current.featureEnablement, ...input.featureEnablement },
          dashboardWidgets: { ...current.dashboardWidgets, ...input.dashboardWidgets },
          privacy: { ...current.privacy, ...input.privacy },
          updatedAt: dependencies.clock.now(),
        });
        return dependencies.repository.updatePreferences(next);
      });
    },
    updatePlatformSettings<TPlatform extends keyof PlatformPreferences>(
      context: SettingsContext,
      platform: TPlatform,
      input: Partial<PlatformPreferences[TPlatform]>,
    ): Promise<UserSettings> {
      return serialize(async () => {
        const current = await ensure(context);
        return dependencies.repository.updatePreferences(userSettingsSchema.parse({
          ...current,
          platform: { ...current.platform, [platform]: { ...current.platform[platform], ...input } },
          updatedAt: dependencies.clock.now(),
        }));
      });
    },
  });
}

export type SettingsService = ReturnType<typeof createSettingsService>;
