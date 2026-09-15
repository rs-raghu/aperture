import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { HealthProvider, OverviewScreen, healthNavigation, useHealth } from "../src/features/health";
import { createHealthTestRuntime } from "../src/features/health/testing/create-test-runtime";

function WorkflowHarness() {
  const { service, context, clock } = useHealth();
  const [complete, setComplete] = useState(false);
  const [overview, setOverview] = useState(false);
  const run = async () => {
    await service.createHealthProfile(context, { measurementSystem: "metric", birthDate: "2000-01-01" });
    await service.recordHealthMeasurement(context, { type: "weight", measurement: { value: "70", unit: "kilogram" }, observedAt: "2040-01-01T07:00:00Z" });
    await service.recordVitalReading(context, { reading: { type: "resting_heart_rate", value: { value: 60, unit: "beats_per_minute" } }, observedAt: "2040-01-01T07:05:00Z" });
    const exercise = await service.createExercise(context, { name: "Synthetic squat", category: "strength" });
    const plan = await service.createWorkoutPlan(context, { title: "Synthetic plan" });
    await service.activateWorkoutPlan(context, plan.id);
    const workout = await service.createWorkoutSession(context, { title: "Synthetic workout", workoutPlanId: plan.id });
    await service.recordExerciseSet(context, { workoutSessionId: workout.id, exerciseId: exercise.id, sequence: 1, repetitions: { value: 8, unit: "repetition" }, weight: { value: "40", unit: "kilogram" } });
    await service.startWorkout(context, workout.id, "2040-01-01T07:10:00Z");
    await service.pauseWorkout(context, workout.id, "2040-01-01T07:20:00Z");
    await service.resumeWorkout(context, workout.id, "2040-01-01T07:25:00Z");
    await service.completeWorkout(context, workout.id, clock.now());
    const route = await service.createActivityRoute(context, { title: "Synthetic loop", distance: { value: "5", unit: "kilometer" } });
    const equipment = await service.createEquipment(context, { name: "Synthetic shoes", category: "running_shoes" });
    const activity = await service.createRunningActivity(context, { title: "Synthetic run", startedAt: "2040-01-01T07:15:00Z", routeId: route.id, equipmentIds: [equipment.id] });
    await service.updateRunningActivity(context, activity.id, { distance: { value: "5", unit: "kilometer" }, duration: { value: "30", unit: "minute" } });
    await service.recordEquipmentUsage(context, { equipmentId: equipment.id, runningActivityId: activity.id, distance: { value: "5", unit: "kilometer" }, duration: { value: "30", unit: "minute" } });
    await service.completeRunningActivity(context, activity.id, clock.now());
    await service.recordSleep(context, { startedAt: "2039-12-31T22:00:00Z", endedAt: "2040-01-01T06:00:00Z", duration: { value: "8", unit: "hour" }, quality: "good" });
    await service.createNutritionEntry(context, { title: "Synthetic breakfast", mealType: "breakfast", consumedAt: "2040-01-01T07:00:00Z", energy: { value: "500", unit: "kilocalorie" } });
    await service.recordHydration(context, { volume: { value: "350", unit: "milliliter" }, consumedAt: "2040-01-01T07:30:00Z" });
    await service.recordPersonalRecord(context, { title: "Synthetic 5K", metric: { type: "distance", value: { value: "5", unit: "kilometer" } }, achievedAt: clock.now() });
    await service.recordRecoveryEntry(context, { observedAt: clock.now(), energy: { value: 8, scale: "one_to_ten" }, fatigue: { value: 3, scale: "one_to_ten" } });
    setComplete(true);
  };
  if (overview) return <OverviewScreen />;
  return <View><Pressable accessibilityRole="button" accessibilityLabel="Run Health workflow" onPress={() => void run()}><Text>Run</Text></Pressable>{complete ? <><Text>Health workflow complete</Text><Pressable accessibilityRole="button" accessibilityLabel="Navigate to Health overview" onPress={() => setOverview(true)}><Text>Overview</Text></Pressable></> : null}</View>;
}

describe("Health mobile workflow", () => {
  it("preserves real service state while navigating within one provider", async () => {
    const runtime = createHealthTestRuntime();
    const view = await render(<HealthProvider createRuntime={() => runtime}><WorkflowHarness /></HealthProvider>);
    await fireEvent.press(view.getByRole("button", { name: "Run Health workflow" }));
    await view.findByText("Health workflow complete");
    await fireEvent.press(view.getByRole("button", { name: "Navigate to Health overview" }));
    await waitFor(() => expect(view.getByText("70 kilogram")).toBeTruthy());
    expect(view.getAllByText("1", { exact: true }).length).toBeGreaterThan(0);
    expect((await runtime.service.listWorkoutSessions(runtime.context)).items[0]?.status).toBe("completed");
    expect((await runtime.service.listRunningActivities(runtime.context)).items[0]?.status).toBe("completed");
  });

  it("renders explicit empty state and the nine Health workflow links", async () => {
    const view = await render(<HealthProvider createRuntime={() => createHealthTestRuntime()}><OverviewScreen /></HealthProvider>);
    await view.findByText("Health profile not set up");
    expect(view.getByRole("button", { name: "Open profile" })).toBeTruthy();
    expect(healthNavigation).toHaveLength(9);
    expect(new Set(healthNavigation.map((item) => item.href)).size).toBe(9);
  });
});
