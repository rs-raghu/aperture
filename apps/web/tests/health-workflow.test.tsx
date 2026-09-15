import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HealthProvider } from "@/features/health/providers/health-provider";
import { GoalsScreen } from "@/features/health/screens/goals-screen";
import { HydrationScreen } from "@/features/health/screens/hydration-screen";
import { MeasurementsScreen } from "@/features/health/screens/measurements-screen";
import { NutritionScreen } from "@/features/health/screens/nutrition-screen";
import { OverviewScreen } from "@/features/health/screens/overview-screen";
import { ProfileScreen } from "@/features/health/screens/profile-screen";
import { RunningScreen } from "@/features/health/screens/running-screen";
import { SleepScreen } from "@/features/health/screens/sleep-screen";
import { VitalsScreen } from "@/features/health/screens/vitals-screen";
import { WorkoutsScreen } from "@/features/health/screens/workouts-screen";
import { createDeterministicHealthRuntime } from "@/features/health/testing/create-test-runtime";

const OWNER = "80000000-0000-4000-8000-000000000003";

describe("Health web workflows", () => {
  it("creates and edits a profile, records observations, filters them, and updates the overview", async () => {
    const user = userEvent.setup();
    const runtime = createDeterministicHealthRuntime(OWNER);
    const createRuntime = () => runtime;
    const view = render(<HealthProvider ownerId={OWNER} createRuntime={createRuntime}><ProfileScreen /></HealthProvider>);

    await screen.findByRole("heading", { name: "Create profile" });
    await user.selectOptions(screen.getByLabelText("Measurement system *"), "imperial");
    fireEvent.change(screen.getByLabelText("Birth date"), { target: { value: "2000-01-02" } });
    await user.click(screen.getByRole("button", { name: "Create profile" }));
    await screen.findByRole("heading", { name: "Edit profile" });
    await user.selectOptions(screen.getByLabelText("Measurement system *"), "metric");
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    await waitFor(async () => expect((await runtime.service.getHealthProfile(runtime.context))?.measurementSystem).toBe("metric"));

    view.rerender(<HealthProvider ownerId={OWNER} createRuntime={createRuntime}><MeasurementsScreen /></HealthProvider>);
    await screen.findByRole("heading", { name: "Record measurement" });
    await user.type(screen.getByLabelText("Value *"), "70.5");
    fireEvent.change(screen.getByLabelText("Observed at *"), { target: { value: "2040-01-01T06:30" } });
    await user.click(screen.getByRole("button", { name: "Record measurement" }));
    await screen.findByText(/70.5 kilogram/);
    await user.selectOptions(screen.getByLabelText("Filter by type"), "height");
    await screen.findByText("No measurements found");
    await user.selectOptions(screen.getByLabelText("Filter by type"), "weight");

    view.rerender(<HealthProvider ownerId={OWNER} createRuntime={createRuntime}><VitalsScreen /></HealthProvider>);
    await screen.findByRole("heading", { name: "Record vital reading" });
    await user.type(screen.getByLabelText("Value *"), "62");
    fireEvent.change(screen.getByLabelText("Observed at *"), { target: { value: "2040-01-01T07:00" } });
    await user.click(screen.getByRole("button", { name: "Record vital" }));
    await screen.findByText(/62 beats per minute/);

    view.rerender(<HealthProvider ownerId={OWNER} createRuntime={createRuntime}><OverviewScreen /></HealthProvider>);
    await waitFor(() => expect(screen.getByText("Measurement types").parentElement?.textContent).toContain("1"));
    expect(document.body.textContent).toContain("70.5 kilogram");
    expect(document.body.textContent).not.toContain("[object Object]");
  });

  it("manages exercises, sets, workout transitions, runs, results, and equipment usage", async () => {
    const user = userEvent.setup();
    const runtime = createDeterministicHealthRuntime(OWNER);
    const createRuntime = () => runtime;
    const view = render(<HealthProvider ownerId={OWNER} createRuntime={createRuntime}><WorkoutsScreen /></HealthProvider>);

    await screen.findByRole("heading", { name: "Exercise catalog" });
    await user.type(screen.getByLabelText("Exercise name *"), "Synthetic squat");
    await user.click(screen.getByRole("button", { name: "Create exercise" }));
    await screen.findByRole("heading", { name: "Synthetic squat" });
    await user.type(screen.getByLabelText("Plan title *"), "Synthetic plan");
    await user.click(screen.getByRole("button", { name: "Create plan" }));
    await screen.findByRole("heading", { name: "Synthetic plan" });
    await user.click(screen.getByRole("button", { name: "Activate" }));

    await user.type(screen.getByLabelText("Workout title *"), "Synthetic session");
    const planSelect = screen.getByLabelText("Plan");
    await user.selectOptions(planSelect, within(planSelect).getByRole("option", { name: "Synthetic plan" }));
    await user.click(screen.getByRole("button", { name: "Create workout" }));
    await screen.findByRole("heading", { name: "Synthetic session" });

    const workoutSelect = screen.getByLabelText("Workout *");
    const exerciseSelect = screen.getByLabelText("Exercise *");
    await user.selectOptions(workoutSelect, within(workoutSelect).getByRole("option", { name: "Synthetic session" }));
    await user.selectOptions(exerciseSelect, within(exerciseSelect).getByRole("option", { name: "Synthetic squat" }));
    await user.type(screen.getByLabelText("Set number *"), "1");
    await user.type(screen.getByLabelText("Repetitions"), "8");
    await user.type(screen.getByLabelText("Weight in kg"), "40");
    await user.click(screen.getByRole("button", { name: "Record set" }));
    await screen.findByText(/8 reps/);

    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.click(await screen.findByRole("button", { name: "Pause" }));
    await user.click(await screen.findByRole("button", { name: "Resume" }));
    await user.click(await screen.findByRole("button", { name: "Complete" }));
    await waitFor(async () => expect((await runtime.service.listWorkoutSessions(runtime.context)).items[0]?.status).toBe("completed"));

    view.rerender(<HealthProvider ownerId={OWNER} createRuntime={createRuntime}><RunningScreen /></HealthProvider>);
    await screen.findByRole("heading", { name: "Routes" });
    await user.type(screen.getByLabelText("Route title *"), "Synthetic loop");
    await user.type(screen.getByLabelText("Distance in km"), "5");
    await user.click(screen.getByRole("button", { name: "Create route" }));
    await screen.findByRole("heading", { name: "Synthetic loop" });
    await user.type(screen.getByLabelText("Equipment name *"), "Synthetic shoes");
    await user.click(screen.getByRole("button", { name: "Create equipment" }));
    await screen.findByRole("heading", { name: "Synthetic shoes" });

    await user.type(screen.getByLabelText("Run title *"), "Synthetic run");
    fireEvent.change(screen.getByLabelText("Started at *"), { target: { value: "2040-01-01T07:15" } });
    const routeSelect = screen.getByLabelText("Route");
    const equipmentSelect = screen.getByLabelText("Equipment");
    await user.selectOptions(routeSelect, within(routeSelect).getByRole("option", { name: "Synthetic loop" }));
    await user.selectOptions(equipmentSelect, within(equipmentSelect).getByRole("option", { name: "Synthetic shoes" }));
    await user.click(screen.getByRole("button", { name: "Create run" }));
    await screen.findByRole("heading", { name: "Synthetic run" });
    const resultActivitySelect = screen.getByLabelText("Activity *");
    await user.selectOptions(resultActivitySelect, within(resultActivitySelect).getByRole("option", { name: "Synthetic run" }));
    await user.type(screen.getByLabelText("Distance in km *"), "5");
    await user.type(screen.getByLabelText("Duration in minutes *"), "30");
    await user.click(screen.getByRole("button", { name: "Save result" }));
    await waitFor(async () => expect((await runtime.service.listRunningActivities(runtime.context)).items[0]?.distance?.value).toBe("5"));
    const usageEquipmentSelect = screen.getByLabelText("Used equipment *");
    await user.selectOptions(usageEquipmentSelect, within(usageEquipmentSelect).getByRole("option", { name: "Synthetic shoes" }));
    await user.type(screen.getByLabelText("Usage distance in km *"), "5");
    await user.type(screen.getByLabelText("Usage duration in minutes *"), "30");
    await user.click(screen.getByRole("button", { name: "Record usage" }));
    await user.click(screen.getByRole("button", { name: "Complete" }));
    await waitFor(async () => expect((await runtime.service.listRunningActivities(runtime.context)).items[0]?.status).toBe("completed"));
  }, 30_000);

  it("records sleep, nutrition, hydration, achieved milestones, and recovery observations", async () => {
    const user = userEvent.setup();
    const runtime = createDeterministicHealthRuntime(OWNER);
    const createRuntime = () => runtime;
    const view = render(<HealthProvider ownerId={OWNER} createRuntime={createRuntime}><SleepScreen /></HealthProvider>);

    fireEvent.change(await screen.findByLabelText("Started at *"), { target: { value: "2039-12-31T22:00" } });
    fireEvent.change(screen.getByLabelText("Ended at *"), { target: { value: "2040-01-01T06:00" } });
    await user.type(screen.getByLabelText("Duration in minutes"), "480");
    await user.selectOptions(screen.getByLabelText("Quality"), "good");
    await user.click(screen.getByRole("button", { name: "Record sleep" }));
    await screen.findByRole("heading", { name: "good" });

    view.rerender(<HealthProvider ownerId={OWNER} createRuntime={createRuntime}><NutritionScreen /></HealthProvider>);
    await user.type(await screen.findByLabelText("Entry title *"), "Synthetic breakfast");
    fireEvent.change(screen.getByLabelText("Consumed at *"), { target: { value: "2040-01-01T07:00" } });
    await user.type(screen.getByLabelText("Energy in kcal"), "500");
    await user.click(screen.getByRole("button", { name: "Add entry" }));
    await screen.findByRole("heading", { name: "Synthetic breakfast" });

    view.rerender(<HealthProvider ownerId={OWNER} createRuntime={createRuntime}><HydrationScreen /></HealthProvider>);
    await user.type(await screen.findByLabelText("Volume in milliliters *"), "350");
    fireEvent.change(screen.getByLabelText("Consumed at *"), { target: { value: "2040-01-01T07:30" } });
    await user.click(screen.getByRole("button", { name: "Record hydration" }));
    await screen.findByRole("heading", { name: "350 milliliter" });
    expect(document.body.textContent).toContain("350 ml across the visible records");

    view.rerender(<HealthProvider ownerId={OWNER} createRuntime={createRuntime}><GoalsScreen /></HealthProvider>);
    await user.type(await screen.findByLabelText("Milestone title *"), "Synthetic 5K");
    await user.type(screen.getByLabelText("Metric value *"), "5");
    fireEvent.change(screen.getByLabelText("Achieved at *"), { target: { value: "2040-01-01T08:00" } });
    await user.click(screen.getByRole("button", { name: "Add record" }));
    await screen.findByRole("heading", { name: "Synthetic 5K" });
    fireEvent.change(screen.getByLabelText("Observed at *"), { target: { value: "2040-01-01T08:00" } });
    await user.type(screen.getByLabelText("Energy (1–10) *"), "8");
    await user.type(screen.getByLabelText("Fatigue (1–10) *"), "3");
    await user.click(screen.getByRole("button", { name: "Add observation" }));
    await screen.findByText(/Energy 8\/10/);
    expect(document.body.textContent).not.toContain("[object Object]");
  }, 30_000);
});
