import {
  createBackupService,
  createRepositoryFeatureAdapter,
  checksum,
  type BackupCollectionDefinition,
  type BackupFeatureAdapter,
  type BackupMetadata,
  type BackupService,
} from "@aperture/backup";
import { integrationStatusSchema, userSettingsSchema, type IntegrationStatus, type SettingsRepository, type UserSettings } from "@aperture/settings";
import { plannerItemLinkSchema, plannerItemSchema, plannerPlanSchema } from "@aperture/planner";
import { recordEquipmentUsageInputSchema, type RecordEquipmentUsageInput } from "@aperture/health";
import { PostgresCollection, type DurableEntity } from "./store/postgres-collection.js";

import { createEducationPostgresRepository, validateEducationBackupRecord } from "./education-postgres.repository.js";
import { createFinancePostgresRepository, validateFinanceBackupRecord } from "./finance-postgres.repository.js";
import { createHealthPostgresRepository, validateHealthBackupRecord } from "./health-postgres.repository.js";
import { createPlannerPostgresRepository } from "./planner-postgres.repository.js";
import { createSettingsPostgresRepository } from "./settings-postgres.repository.js";
import type { PostgresRepositorySet, SqlExecutor, TransactionalSqlExecutor } from "./postgres.types.js";

type RepositoryMap = Readonly<Record<string, unknown>>;

function repositorySet(database: SqlExecutor): PostgresRepositorySet {
  return Object.freeze({
    education: createEducationPostgresRepository(database),
    health: createHealthPostgresRepository(database),
    finance: createFinancePostgresRepository(database),
    planner: createPlannerPostgresRepository(database),
    settings: createSettingsPostgresRepository(database),
  });
}

const EDUCATION_ORDER = ["institutions", "programs", "semesters", "courses", "topics", "assignments", "exams", "grades", "attendance", "studySessions", "schedules", "resources", "certificates", "goals"] as const;
const EDUCATION_TABLES = ["institutions", "programs", "semesters", "courses", "topics", "assignments", "exams", "grades", "attendance", "study_sessions", "schedules", "resources", "certificates", "goals"] as const;
const HEALTH_ORDER = ["profiles", "measurements", "vitalReadings", "bodyComposition", "sleepRecords", "nutritionEntries", "hydrationEntries", "medications", "medicationLogs", "symptomEntries", "appointments", "laboratoryResults", "exercises", "workoutPlans", "workoutSessions", "exerciseSets", "activityRoutes", "equipment", "runningActivities", "runningSplits", "personalRecords", "recoveryEntries"] as const;
const HEALTH_TABLES = ["profiles", "measurements", "vital_readings", "body_composition", "sleep_records", "nutrition_entries", "hydration_entries", "medications", "medication_logs", "symptom_entries", "appointments", "laboratory_results", "exercises", "workout_plans", "workout_sessions", "exercise_sets", "activity_routes", "equipment", "running_activities", "running_splits", "personal_records", "recovery_entries", "equipment_usage"] as const;
const FINANCE_ORDER = ["accounts", "categories", "transactions", "transactionSplits", "budgets", "budgetLines", "recurringTransactions", "incomeSources", "assets", "liabilities", "netWorthSnapshots", "investmentAccounts", "holdings", "trades", "dividends", "marketPrices", "loans", "loanPayments", "taxProfiles", "taxRecords", "insurancePolicies", "financialGoals", "financialImports", "financialImportRows", "financialDocuments", "calculatorScenarios"] as const;
const FINANCE_TABLES = ["accounts", "categories", "transactions", "transaction_splits", "budgets", "budget_lines", "recurring_transactions", "income_sources", "assets", "liabilities", "net_worth_snapshots", "investment_accounts", "holdings", "trades", "dividends", "market_prices", "loans", "loan_payments", "tax_profiles", "tax_records", "insurance_policies", "financial_goals", "financial_imports", "financial_import_rows", "financial_documents", "calculator_scenarios"] as const;
const PLANNER_ORDER = ["plans", "items", "itemLinks"] as const;
const PLANNER_TABLES = ["plans", "items", "item_links"] as const;

function definitions(
  repositories: RepositoryMap,
  names: readonly string[],
  validate?: (name: string, value: unknown) => boolean,
): readonly BackupCollectionDefinition[] {
  return names.map((name) => {
    const repository = repositories[name];
    if (typeof repository !== "object" || repository === null) throw new Error(`Backup repository ${name} is unavailable.`);
    const runtime = repository as Record<string, unknown>;
    const singletonList = typeof runtime.findMany !== "function" && typeof runtime.findByOwner === "function"
      ? async (ownerId: string) => {
          const value = await (runtime.findByOwner as (ownerId: string) => Promise<unknown>)(ownerId);
          return value === null ? [] : [value];
        }
      : undefined;
    return {
      name,
      repository: repository as unknown as BackupCollectionDefinition["repository"],
      ...(validate === undefined ? {} : { validate: (value: unknown) => validate(name, value) }),
      ...(singletonList === undefined ? {} : { list: singletonList }),
    };
  });
}

function settingsAdapter(repository: SettingsRepository, database?: SqlExecutor): BackupFeatureAdapter {
  async function preferences(ownerId: string): Promise<readonly UserSettings[]> {
    const value = await repository.findPreferences(ownerId);
    return value === null ? [] : [value];
  }
  async function integrations(ownerId: string): Promise<readonly IntegrationStatus[]> { return repository.listIntegrationStatuses(ownerId); }
  async function merge(ownerId: string, payload: import("@aperture/backup").BackupFeaturePayload): Promise<void> {
    const record = payload.collections[0]?.records[0];
    if (record !== undefined) await repository.createPreferences(record as unknown as UserSettings);
    for (const status of payload.collections[1]?.records ?? []) await repository.createIntegrationStatus(integrationStatusSchema.parse({ ...status, status: "disconnected" }));
  }
  const adapter: BackupFeatureAdapter = {
    featureId: "settings",
    schemaVersion: 1,
    async export(ownerId: string) { return [
      { name: "preferences", records: await preferences(ownerId) as unknown as readonly import("@aperture/backup").JsonObject[] },
      { name: "integrationStatuses", records: await integrations(ownerId) as unknown as readonly import("@aperture/backup").JsonObject[] },
    ]; },
    async validate(ownerId: string, payload: import("@aperture/backup").BackupFeaturePayload) {
      const collection = payload.collections.length === 2 && payload.collections[0]?.name === "preferences" && payload.collections[1]?.name === "integrationStatuses" ? payload.collections[0] : undefined;
      if (collection === undefined || collection.records.length > 1) return [{ code: "backup-invalid-feature", message: "Settings must contain preferences and sanitized integration-status collections.", featureId: "settings" }];
      const candidate = collection.records[0];
      const preferenceValid = candidate === undefined || (userSettingsSchema.safeParse(candidate).success && candidate.ownerId === ownerId);
      const statusesValid = payload.collections[1]!.records.every((status) => integrationStatusSchema.safeParse(status).success && status.ownerId === ownerId);
      return preferenceValid && statusesValid ? [] : [{ code: "backup-invalid-feature", message: "A settings record is invalid.", featureId: "settings" }];
    },
    async listRecordIdentities(ownerId: string) {
      const credentialRows = database === undefined ? [] : (await database.query<{ id: string }>("select id from platform.integration_credentials where owner_id = $1 and deleted_at is null", [ownerId])).rows;
      return [
        ...(await preferences(ownerId)).map((record) => ({ collection: "preferences", recordId: record.id, fingerprint: checksum(record) })),
        ...(await integrations(ownerId)).map((record) => ({ collection: "integrationStatuses", recordId: record.id, fingerprint: checksum(record) })),
        ...credentialRows.map(({ id }) => ({ collection: "integrationCredentials", recordId: id })),
      ];
    },
    async replace(ownerId: string, payload: import("@aperture/backup").BackupFeaturePayload) { await adapter.deleteAll(ownerId); await merge(ownerId, payload); },
    merge,
    async deleteAll(ownerId: string) {
      if (database === undefined) { await repository.deleteIntegrationStatuses(ownerId); await repository.deletePreferences(ownerId); }
      else {
        await database.query("delete from platform.integration_credentials where owner_id = $1", [ownerId]);
        await database.query("delete from platform.integration_connections where owner_id = $1", [ownerId]);
        await database.query("delete from platform.user_preferences where owner_id = $1", [ownerId]);
      }
    },
  };
  return Object.freeze(adapter);
}

function withHardDelete(
  adapter: BackupFeatureAdapter,
  database: SqlExecutor | undefined,
  schema: string,
  tables: readonly string[],
): BackupFeatureAdapter {
  if (database === undefined) return adapter;
  const deleteAll = async (ownerId: string) => {
    for (const table of [...tables].reverse()) await database.query(`delete from ${schema}.${table} where owner_id = $1`, [ownerId]);
  };
  return Object.freeze({
    ...adapter,
    async replace(ownerId: string, payload: import("@aperture/backup").BackupFeaturePayload) { await deleteAll(ownerId); await adapter.merge(ownerId, payload); },
    deleteAll,
  });
}

function equipmentUsageDefinition(database?: SqlExecutor): BackupCollectionDefinition {
  type Usage = DurableEntity & RecordEquipmentUsageInput;
  const collection = database === undefined ? undefined : new PostgresCollection<Usage>(database, {
    schema: "health", table: "equipment_usage", project: (record) => ({ equipment_id: record.equipmentId, used_at: record.createdAt }),
  });
  return {
    name: "equipmentUsage",
    validate(value) {
      if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = value as Record<string, unknown>;
      return recordEquipmentUsageInputSchema.safeParse(input).success;
    },
    repository: {
      async findMany(query) { return collection === undefined ? { items: [] } : collection.findMany(query, () => true, (left, right) => left.id.localeCompare(right.id)); },
      async create(input) {
        if (collection === undefined) throw new Error("Equipment usage restoration requires durable storage.");
        return collection.create(input as Usage);
      },
    },
  };
}

export function createBackupFeatureAdapters(repositories: PostgresRepositorySet, database?: SqlExecutor, readOnly = false): readonly BackupFeatureAdapter[] {
  const education = createRepositoryFeatureAdapter("education", definitions(repositories.education as unknown as RepositoryMap, EDUCATION_ORDER, (name, value) => validateEducationBackupRecord(name as typeof EDUCATION_ORDER[number], value)));
  const health = createRepositoryFeatureAdapter("health", [...definitions(repositories.health as unknown as RepositoryMap, HEALTH_ORDER, (name, value) => validateHealthBackupRecord(name as typeof HEALTH_ORDER[number], value)), equipmentUsageDefinition(database)]);
  const finance = createRepositoryFeatureAdapter("finance", definitions(repositories.finance as unknown as RepositoryMap, FINANCE_ORDER, (name, value) => validateFinanceBackupRecord(name as typeof FINANCE_ORDER[number], value)));
  const plannerSchemas = { plans: plannerPlanSchema, items: plannerItemSchema, itemLinks: plannerItemLinkSchema } as const;
  const planner = createRepositoryFeatureAdapter("planner", definitions(repositories.planner as unknown as RepositoryMap, PLANNER_ORDER, (name, value) => plannerSchemas[name as keyof typeof plannerSchemas].safeParse(value).success));
  const mutationDatabase = readOnly ? undefined : database;
  return Object.freeze([
    withHardDelete(education, mutationDatabase, "education", EDUCATION_TABLES),
    withHardDelete(health, mutationDatabase, "health", HEALTH_TABLES),
    withHardDelete(finance, mutationDatabase, "finance", FINANCE_TABLES),
    withHardDelete(planner, mutationDatabase, "planner", PLANNER_TABLES),
    settingsAdapter(repositories.settings, mutationDatabase),
  ]);
}

async function recordMetadata(database: SqlExecutor, value: BackupMetadata): Promise<void> {
  const payload = {
    id: value.backupId,
    ownerId: value.ownerId,
    schemaVersion: String(value.schemaVersion),
    createdAt: value.exportedAt,
    updatedAt: value.exportedAt,
    includedDomains: value.scope.featureIds,
    recordCount: value.recordCount,
    checksum: value.checksum,
  };
  await database.query(
    "insert into platform.backup_manifests (id, owner_id, payload, created_at, updated_at, format_version, created_at_source, content_checksum, storage_key, scope, record_count) values ($1, $2, $3::jsonb, $4::timestamptz, $4::timestamptz, $5, $4::timestamptz, $6, $7, $8::jsonb, $9)",
    [value.backupId, value.ownerId, JSON.stringify(payload), value.exportedAt, String(value.schemaVersion), value.checksum, `inline:${value.backupId}`, JSON.stringify(value.scope), value.recordCount],
  );
}

export interface CreatePostgresBackupServiceOptions {
  readonly clock: { now(): string };
  readonly idGenerator: { generate(): string };
  readonly additionalAdapters?: (database: SqlExecutor) => readonly BackupFeatureAdapter[];
}

export function createPostgresBackupService(database: TransactionalSqlExecutor, options: CreatePostgresBackupServiceOptions): BackupService {
  const repositories = repositorySet(database);
  return createBackupService({
    adapters: [...createBackupFeatureAdapters(repositories, database), ...(options.additionalAdapters?.(database) ?? [])],
    clock: options.clock,
    idGenerator: options.idGenerator,
    async readUnits(ownerId) {
      const settings = await repositories.settings.findPreferences(ownerId);
      return settings === null ? {} : {
        currency: settings.currency,
        measurementSystem: settings.units.measurementSystem,
        temperatureUnit: settings.units.temperatureUnit,
        distanceUnit: settings.units.distanceUnit,
        massUnit: settings.units.massUnit,
      };
    },
    metadataRepository: { record: (value) => recordMetadata(database, value) },
    transactionRunner: {
      async run(work) {
        if (typeof database.transaction !== "function") throw new Error("Transactional restore is unavailable.");
        return database.transaction((transaction) => work([...createBackupFeatureAdapters(repositorySet(transaction), transaction), ...(options.additionalAdapters?.(transaction) ?? [])]));
      },
    },
  });
}
