import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { featureRegistry } from "@aperture/feature-registry";
import { createSettingsMemoryRepository, createSettingsService } from "@aperture/settings";
import { SettingsProvider, SettingsScreen } from "@/features/settings";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function runtime() {
  const service = createSettingsService({
    repository: createSettingsMemoryRepository(), clock: { now: () => "2040-04-01T08:00:00.000Z" },
    idGenerator: { generate: () => "00000000-0000-4000-8000-000000000711" },
    protectedFeatureIds: featureRegistry.listFeatures().filter(({ disableAllowed }) => !disableAllowed).map(({ id }) => id),
    knownFeatureIds: featureRegistry.listFeatures().map(({ id }) => id), knownWidgetIds: featureRegistry.widgets("web").map(({ id }) => id),
  });
  return { service, ownerId: OWNER };
}

describe("web settings", () => {
  it("loads safe defaults and persists privacy, theme, feature, and widget choices", async () => {
    const value = runtime();
    render(<SettingsProvider runtime={value}><SettingsScreen /></SettingsProvider>);
    expect(await screen.findByRole("heading", { name: "Shape your private workspace" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Theme"), { target: { value: "dark" } });
    fireEvent.click(screen.getByLabelText("Crash reports"));
    fireEvent.click(screen.getByLabelText("Education"));
    fireEvent.click(screen.getByLabelText("Health plans"));
    await waitFor(async () => expect(await value.service.getSettings({ ownerId: OWNER })).toMatchObject({ theme: "dark", privacy: { crashReports: true }, featureEnablement: { education: false }, dashboardWidgets: { "health.plans": false } }));
    expect(screen.getByText("No integrations connected")).toBeTruthy();
  });
});
