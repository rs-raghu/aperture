import { describe, expect, it } from "vitest";

import type { HealthRepository, OwnerId, PageResult } from "@aperture/health";
import {
  CREATED_AT,
  FIXTURE_IDS,
  OWNER_A,
  OWNER_B,
  UPDATED_AT,
  buildActivityRoute,
  buildAppointment,
  buildBodyComposition,
  buildEquipment,
  buildExercise,
  buildExerciseSet,
  buildHealthMeasurement,
  buildHydrationEntry,
  buildLaboratoryResult,
  buildMedication,
  buildMedicationLog,
  buildNutritionEntry,
  buildPersonalRecord,
  buildRecoveryEntry,
  buildRunningActivity,
  buildRunningSplit,
  buildSleepRecord,
  buildSymptomEntry,
  buildVitalReading,
  buildWorkoutPlan,
  buildWorkoutSession,
} from "../fixtures/health-fixtures.js";

interface ContractEntity {
  readonly id: string;
  readonly ownerId: OwnerId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface ContractQuery {
  readonly ownerId: OwnerId;
  readonly cursor?: string | undefined;
  readonly limit?: number | undefined;
}

interface ContractRepository {
  create(entity: ContractEntity): Promise<ContractEntity>;
  update(entity: ContractEntity): Promise<ContractEntity>;
  delete(id: string, ownerId: OwnerId): Promise<void>;
  findById(id: string, ownerId: OwnerId): Promise<ContractEntity | null>;
  findMany(query: ContractQuery): Promise<PageResult<ContractEntity>>;
}

interface RepositoryCase {
  readonly name: string;
  readonly select: (repository: HealthRepository) => ContractRepository;
  readonly build: (overrides?: Partial<ContractEntity>) => ContractEntity;
}

function repositoryCase<TEntity extends ContractEntity>(
  name: string,
  select: (repository: HealthRepository) => object,
  build: (overrides?: Partial<TEntity>) => TEntity,
): RepositoryCase {
  return {
    name,
    select: (repository) => select(repository) as ContractRepository,
    build: (overrides = {}) => build(overrides as Partial<TEntity>),
  };
}

const cases: readonly RepositoryCase[] = [
  repositoryCase("measurements", (repository) => repository.measurements, buildHealthMeasurement),
  repositoryCase("vital readings", (repository) => repository.vitalReadings, buildVitalReading),
  repositoryCase("body composition", (repository) => repository.bodyComposition, buildBodyComposition),
  repositoryCase("sleep records", (repository) => repository.sleepRecords, buildSleepRecord),
  repositoryCase("nutrition entries", (repository) => repository.nutritionEntries, buildNutritionEntry),
  repositoryCase("hydration entries", (repository) => repository.hydrationEntries, buildHydrationEntry),
  repositoryCase("medications", (repository) => repository.medications, buildMedication),
  repositoryCase("medication logs", (repository) => repository.medicationLogs, buildMedicationLog),
  repositoryCase("symptom entries", (repository) => repository.symptomEntries, buildSymptomEntry),
  repositoryCase("appointments", (repository) => repository.appointments, buildAppointment),
  repositoryCase("laboratory results", (repository) => repository.laboratoryResults, buildLaboratoryResult),
  repositoryCase("exercises", (repository) => repository.exercises, buildExercise),
  repositoryCase("workout plans", (repository) => repository.workoutPlans, buildWorkoutPlan),
  repositoryCase("workout sessions", (repository) => repository.workoutSessions, buildWorkoutSession),
  repositoryCase("exercise sets", (repository) => repository.exerciseSets, buildExerciseSet),
  repositoryCase("running activities", (repository) => repository.runningActivities, buildRunningActivity),
  repositoryCase("running splits", (repository) => repository.runningSplits, buildRunningSplit),
  repositoryCase("activity routes", (repository) => repository.activityRoutes, buildActivityRoute),
  repositoryCase("equipment", (repository) => repository.equipment, buildEquipment),
  repositoryCase("personal records", (repository) => repository.personalRecords, buildPersonalRecord),
  repositoryCase("recovery entries", (repository) => repository.recoveryEntries, buildRecoveryEntry),
];

export type RepositoryContractErrorKind =
  | "duplicate-id"
  | "record-not-found"
  | "immutable-identity"
  | "invalid-query";

export interface HealthRepositoryContractAdapter {
  readonly name: string;
  createRepository(): HealthRepository;
  expectError(action: () => Promise<unknown>, kind: RepositoryContractErrorKind): Promise<void>;
}

export function runHealthRepositoryContractSuite(
  adapter: HealthRepositoryContractAdapter,
): void {
  const { createRepository, expectError } = adapter;
  describe(`${adapter.name} shared repository contract`, () => {
    describe.each(cases)("$name", (contract) => {
      it("creates and returns every supplied field", async () => {
        const repository = contract.select(createRepository());
        const entity = contract.build();
        await expect(repository.create(entity)).resolves.toEqual(entity);
      });

      it("enforces globally unique IDs across owners", async () => {
        const repository = contract.select(createRepository());
        const entity = contract.build();
        await repository.create(entity);
        await expectError(
          () => repository.create(contract.build({ ownerId: OWNER_B })),
          "duplicate-id",
        );
      });

      it("finds owned records and hides them from another owner", async () => {
        const repository = contract.select(createRepository());
        const entity = contract.build();
        await repository.create(entity);
        await expect(repository.findById(entity.id, OWNER_A)).resolves.toEqual(entity);
        await expect(repository.findById(entity.id, OWNER_B)).resolves.toBeNull();
        await expect(repository.findById(FIXTURE_IDS.alternate, OWNER_A)).resolves.toBeNull();
      });

      it("lists only the requested owner", async () => {
        const repository = contract.select(createRepository());
        await repository.create(contract.build());
        await repository.create(contract.build({ id: FIXTURE_IDS.alternate, ownerId: OWNER_B }));
        const page = await repository.findMany({ ownerId: OWNER_A });
        expect(page.items).toHaveLength(1);
        expect(page.items[0]?.ownerId).toBe(OWNER_A);
      });

      it("updates an existing owner-scoped record", async () => {
        const repository = contract.select(createRepository());
        const entity = contract.build();
        await repository.create(entity);
        const updated = { ...entity, updatedAt: "2040-01-01T10:00:00Z" };
        await expect(repository.update(updated)).resolves.toEqual(updated);
        await expect(repository.findById(entity.id, OWNER_A)).resolves.toEqual(updated);
      });

      it("rejects missing updates and owner reassignment", async () => {
        const repository = contract.select(createRepository());
        const entity = contract.build();
        await repository.create(entity);
        await expectError(
          () => repository.update(contract.build({ id: FIXTURE_IDS.alternate })),
          "record-not-found",
        );
        await expectError(
          () => repository.update({ ...entity, ownerId: OWNER_B }),
          "record-not-found",
        );
        await expect(repository.findById(entity.id, OWNER_A)).resolves.toEqual(entity);
      });

      it("rejects creation-timestamp changes", async () => {
        const repository = contract.select(createRepository());
        const entity = contract.build();
        await repository.create(entity);
        await expectError(
          () => repository.update({ ...entity, createdAt: "2039-12-31T08:00:00Z" }),
          "immutable-identity",
        );
      });

      it("deletes only an owned record and rejects missing targets", async () => {
        const repository = contract.select(createRepository());
        const entity = contract.build();
        await repository.create(entity);
        await expectError(
          () => repository.delete(entity.id, OWNER_B),
          "record-not-found",
        );
        await repository.delete(entity.id, OWNER_A);
        await expect(repository.findById(entity.id, OWNER_A)).resolves.toBeNull();
        await expectError(
          () => repository.delete(entity.id, OWNER_A),
          "record-not-found",
        );
      });

      it("defensively copies create and read values", async () => {
        const repository = contract.select(createRepository());
        const entity = contract.build();
        const created = await repository.create(entity);
        (entity as { updatedAt: string }).updatedAt = CREATED_AT;
        (created as { updatedAt: string }).updatedAt = CREATED_AT;
        const found = await repository.findById(entity.id, OWNER_A);
        (found as { updatedAt: string }).updatedAt = CREATED_AT;
        const page = await repository.findMany({ ownerId: OWNER_A });
        (page.items[0] as { updatedAt: string }).updatedAt = CREATED_AT;
        expect((await repository.findById(entity.id, OWNER_A))?.updatedAt).toBe(UPDATED_AT);
      });

      it("paginates deterministic tied values without duplicates or skips", async () => {
        const repository = contract.select(createRepository());
        for (const id of ["page-c", "page-a", "page-b"]) await repository.create(contract.build({ id }));
        const first = await repository.findMany({ ownerId: OWNER_A, limit: 2 });
        expect(first.nextCursor).toMatch(/^health-memory:/);
        const second = await repository.findMany({ ownerId: OWNER_A, limit: 2, cursor: first.nextCursor });
        expect([...first.items, ...second.items].map((entity) => entity.id)).toEqual(["page-a", "page-b", "page-c"]);
      });

      it("rejects malformed, cross-collection, out-of-range, and stale cursors", async () => {
        const aggregate = createRepository();
        const repository = contract.select(aggregate);
        await repository.create(contract.build({ id: "page-a" }));
        await repository.create(contract.build({ id: "page-b" }));
        const first = await repository.findMany({ ownerId: OWNER_A, limit: 1 });
        await expectError(
          () => repository.findMany({ ownerId: OWNER_A, cursor: "invalid" }),
          "invalid-query",
        );
        await expectError(
          () => repository.findMany({ ownerId: OWNER_A, cursor: "health-memory:wrong:2:1" }),
          "invalid-query",
        );
        await expectError(
          () => repository.findMany({ ownerId: OWNER_B, cursor: first.nextCursor }),
          "invalid-query",
        );
        await expectError(
          () => repository.findMany({ ownerId: OWNER_A, cursor: first.nextCursor?.replace(/:1$/, ":99") }),
          "invalid-query",
        );
        await repository.create(contract.build({ id: "page-c" }));
        await expectError(
          () => repository.findMany({ ownerId: OWNER_A, cursor: first.nextCursor }),
          "invalid-query",
        );
      });

      it("rejects invalid limits", async () => {
        const repository = contract.select(createRepository());
        await expectError(
          () => repository.findMany({ ownerId: OWNER_A, limit: 0 }),
          "invalid-query",
        );
        await expectError(
          () => repository.findMany({ ownerId: OWNER_A, limit: 101 }),
          "invalid-query",
        );
      });

      it("does not share records between adapter instances", async () => {
        const first = contract.select(createRepository());
        const second = contract.select(createRepository());
        const entity = contract.build();
        await first.create(entity);
        await expect(second.findById(entity.id, OWNER_A)).resolves.toBeNull();
      });
    });
  });
}
