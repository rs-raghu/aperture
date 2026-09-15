import { describe, expect, it } from "vitest";

import {
  HealthApplicationError,
  createHealthService,
} from "@aperture/health";
import type { HealthApplicationService } from "@aperture/health";
import { createHealthMemoryRepository } from "@aperture/health-memory";
import { OWNER_A, OWNER_B } from "../fixtures/health-fixtures.js";

const NOW = "2040-01-01T08:00:00Z";

function createHarness(): HealthApplicationService {
  let sequence = 0;
  return createHealthService({
    repositories: createHealthMemoryRepository(),
    clock: { now: () => NOW },
    idGenerator: { generate: () => `service-${String(++sequence).padStart(3, "0")}` },
  });
}

describe("Health service with the memory adapter", () => {
  it("runs a representative connected workflow and every summary path", async () => {
    const health = createHarness();
    const context = { ownerId: OWNER_A };
    await health.createHealthProfile(context, { measurementSystem: "metric" });
    const exercise = await health.createExercise(context, { name: "Synthetic squat", category: "strength" });
    const plan = await health.createWorkoutPlan(context, { title: "Synthetic plan", startsOn: "2040-01-01" });
    await health.activateWorkoutPlan(context, plan.id);
    const workout = await health.createWorkoutSession(context, {
      workoutPlanId: plan.id,
      title: "Synthetic session",
      scheduledAt: "2040-01-03T07:00:00Z",
    });
    await health.startWorkout(context, workout.id, "2040-01-03T07:00:00Z");
    await health.recordExerciseSet(context, {
      workoutSessionId: workout.id,
      exerciseId: exercise.id,
      sequence: 1,
      repetitions: { value: 8, unit: "repetition" },
      weight: { value: "40", unit: "kilogram" },
    });
    await health.completeWorkout(context, workout.id, "2040-01-03T08:00:00Z");

    const equipment = await health.createEquipment(context, { name: "Synthetic shoes", category: "running_shoes" });
    const route = await health.createActivityRoute(context, { title: "Synthetic route", distance: { value: "5", unit: "kilometer" } });
    const running = await health.createRunningActivity(context, {
      workoutSessionId: workout.id,
      routeId: route.id,
      equipmentIds: [equipment.id],
      title: "Synthetic run",
      startedAt: "2040-01-03T07:00:00Z",
    });
    await health.updateRunningActivity(context, running.id, {
      distance: { value: "5", unit: "kilometer" },
      duration: { value: "30", unit: "minute" },
    });
    await health.recordRunningSplit(context, {
      runningActivityId: running.id,
      sequence: 1,
      distance: { value: "1", unit: "kilometer" },
      duration: { value: "6", unit: "minute" },
    });
    await health.completeRunningActivity(context, running.id, "2040-01-03T07:30:00Z");
    await health.recordPersonalRecord(context, {
      exerciseId: exercise.id,
      runningActivityId: running.id,
      title: "Synthetic distance record",
      metric: { type: "distance", value: { value: "5", unit: "kilometer" } },
      achievedAt: "2040-01-03T07:30:00Z",
    });
    await health.recordEquipmentUsage(context, {
      equipmentId: equipment.id,
      workoutSessionId: workout.id,
      runningActivityId: running.id,
      distance: { value: "5", unit: "kilometer" },
      duration: { value: "30", unit: "minute" },
    });

    await health.recordHealthMeasurement(context, {
      type: "weight",
      measurement: { value: "70.25", unit: "kilogram" },
      observedAt: "2040-01-03T06:00:00Z",
    });
    await health.recordSleep(context, {
      startedAt: "2040-01-02T22:00:00Z",
      endedAt: "2040-01-03T06:00:00Z",
      duration: { value: "8", unit: "hour" },
      quality: "good",
    });
    await health.recordHydration(context, {
      volume: { value: "500", unit: "milliliter" },
      consumedAt: "2040-01-03T09:00:00Z",
    });
    await health.recordRecoveryEntry(context, {
      observedAt: "2040-01-03T06:30:00Z",
      energy: { value: 7, scale: "one_to_ten" },
      fatigue: { value: 3, scale: "one_to_ten" },
    });
    const appointment = await health.createAppointment(context, {
      title: "Synthetic appointment",
      startsAt: "2040-01-10T10:00:00Z",
    });

    const range = { startsAt: "2040-01-01T00:00:00Z", endsAt: "2040-01-31T23:59:59Z" };
    await expect(health.getHealthOverview(OWNER_A)).resolves.toMatchObject({
      latestMeasurementCount: 1,
      recentWorkoutCount: 1,
      upcomingAppointmentCount: 1,
    });
    await expect(health.getLatestMeasurements(OWNER_A)).resolves.toHaveLength(1);
    await expect(health.getDailyHealthSummary(OWNER_A, "2040-01-03")).resolves.toMatchObject({
      measurementCount: 1,
      hydrationEntryCount: 1,
    });
    await expect(health.getSleepSummary({ ownerId: OWNER_A, range })).resolves.toMatchObject({ recordCount: 1 });
    await expect(health.getHydrationSummary({ ownerId: OWNER_A, range })).resolves.toMatchObject({ totalVolume: { value: "0.5", unit: "liter" } });
    await expect(health.getWorkoutSummary({ ownerId: OWNER_A, range })).resolves.toMatchObject({ workoutCount: 1, completedWorkoutCount: 1, totalDuration: { value: "3600", unit: "second" } });
    await expect(health.getRunningSummary({ ownerId: OWNER_A, range })).resolves.toMatchObject({ activityCount: 1, totalDistance: { value: "5", unit: "kilometer" } });
    await expect(health.getEquipmentUsageSummary(OWNER_A, equipment.id)).resolves.toMatchObject({ useCount: 1, totalDistance: { value: "5", unit: "kilometer" } });
    await expect(health.getRecoverySummary({ ownerId: OWNER_A, range })).resolves.toMatchObject({ entryCount: 1 });
    await expect(health.getUpcomingMedicationReminders({ ownerId: OWNER_A })).resolves.toEqual([]);
    await expect(health.getUpcomingAppointments({ ownerId: OWNER_A })).resolves.toEqual([appointment]);
  });

  it("keeps another owner's records out of service reads and relationship checks", async () => {
    const health = createHarness();
    const ownerA = { ownerId: OWNER_A };
    const ownerB = { ownerId: OWNER_B };
    const exercise = await health.createExercise(ownerA, { name: "Owner A exercise", category: "strength" });
    const workout = await health.createWorkoutSession(ownerA, { title: "Owner A workout" });

    await expect(health.recordExerciseSet(ownerB, {
      workoutSessionId: workout.id,
      exerciseId: exercise.id,
      sequence: 1,
    })).rejects.toMatchObject({ code: "health-parent-not-found" });
    await expect(health.getExercise(ownerB, exercise.id)).resolves.toBeNull();
    await expect(health.listExercises(ownerB)).resolves.toEqual({ items: [] });
  });

  it("surfaces memory conflicts as repository failures without partial writes", async () => {
    const repositories = createHealthMemoryRepository();
    await repositories.profiles.create({
      ownerId: OWNER_A,
      id: "existing-profile",
      createdAt: NOW,
      updatedAt: NOW,
      measurementSystem: "metric",
      status: "active",
    });
    const health = createHealthService({
      repositories,
      clock: { now: () => NOW },
      idGenerator: { generate: () => "second-profile" },
    });
    await expect(health.createHealthProfile({ ownerId: OWNER_A }, { measurementSystem: "imperial" })).rejects.toBeInstanceOf(HealthApplicationError);
    await expect(repositories.profiles.findByOwner(OWNER_A)).resolves.toMatchObject({ id: "existing-profile" });
  });
});
