import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { featureRegistry } from "@aperture/feature-registry";
import { createSettingsMemoryRepository, createSettingsService } from "@aperture/settings";
import { SettingsProvider, SettingsShellScreen } from "../src/features/settings";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("mobile settings", () => {
  it("persists shared privacy choices and isolated mobile behavior", async () => {
    const service = createSettingsService({
      repository: createSettingsMemoryRepository(), clock: { now: () => "2040-04-01T08:00:00.000Z" },
      idGenerator: { generate: () => "00000000-0000-4000-8000-000000000712" },
      protectedFeatureIds: featureRegistry.listFeatures().filter(({ disableAllowed }) => !disableAllowed).map(({ id }) => id),
      knownFeatureIds: featureRegistry.listFeatures().map(({ id }) => id), knownWidgetIds: featureRegistry.widgets("mobile").map(({ id }) => id),
    });
    const view = await render(<SettingsProvider runtime={{ service, ownerId: OWNER }}><SettingsShellScreen /></SettingsProvider>);
    expect(await view.findByText("Shape your private workspace")).toBeTruthy();
    await fireEvent.press(view.getByRole("radio", { name: "dark" }));
    await fireEvent.press(view.getByRole("switch", { name: "Crash reports" }));
    await fireEvent.press(view.getByRole("switch", { name: "Haptics" }));
    await waitFor(async () => expect(await service.getSettings({ ownerId: OWNER })).toMatchObject({ theme: "dark", privacy: { crashReports: true }, platform: { mobile: { haptics: false } } }));
    expect(view.getByText("No integrations connected.")).toBeTruthy();
  });
});
