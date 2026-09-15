import { View } from "react-native";
import { render } from "@testing-library/react-native";
import { ActionButton, ChoiceField, ErrorBanner, RecordCard, RecordList, StatusBadge, TextField } from "../src/features/health/components/ui";
import { toHealthIsoTimestamp } from "../src/features/health/view-models/formatting";

describe("Health mobile accessibility", () => {
  it("normalizes explicit offsets at the presentation boundary and preserves invalid input for validation", () => {
    expect(toHealthIsoTimestamp("2040-01-01T05:30:00+05:30")).toBe("2040-01-01T00:00:00.000Z");
    expect(toHealthIsoTimestamp("invalid timestamp")).toBe("invalid timestamp");
  });

  it("labels invalid input, selection, pending actions, errors, and status in text", async () => {
    const view = await render(<View>
      <TextField name="observedValue" label="Observed value" value="bad" onChangeText={() => undefined} error="Enter a valid observation." />
      <ChoiceField label="Measurement system" value="metric" options={[{ value: "metric", label: "Metric" }, { value: "imperial", label: "Imperial" }]} onChange={() => undefined} />
      <ActionButton label="Save observation" pending onPress={() => undefined} />
      <ErrorBanner error={{ message: "Unable to store the observation.", fieldErrors: {} }} />
      <StatusBadge value="in_progress" />
    </View>);

    expect(view.getByLabelText("Observed value").props.accessibilityHint).toBe("Enter a valid observation.");
    expect(view.getByText("Enter a valid observation.")).toBeTruthy();
    expect(view.getByRole("radio", { name: "Measurement system: Metric" }).props.accessibilityState.selected).toBe(true);
    expect(view.getByRole("button", { name: "Save observation, in progress" }).props.accessibilityState).toMatchObject({ busy: true, disabled: true });
    expect(view.getByLabelText("Unable to continue. Unable to store the observation.").props.accessibilityLiveRegion).toBe("assertive");
    expect(view.getByLabelText("Status: in progress")).toBeTruthy();
  });

  it("uses a virtualized labelled collection and keeps long record text available", async () => {
    const title = "A deliberately long synthetic activity title that must remain readable across narrow mobile layouts";
    const view = await render(<RecordList
      items={[{ id: "long-record", title }]}
      keyExtractor={(item) => item.id}
      accessibilityLabel="Synthetic Health records"
      renderItem={(item) => <RecordCard title={item.title} details={["A long factual detail that wraps without carrying clinical meaning."]} />}
    />);

    expect(view.getByLabelText("Synthetic Health records")).toBeTruthy();
    expect(view.getByText(title)).toBeTruthy();
  });
});
