import { View } from "react-native";
import { render } from "@testing-library/react-native";
import { ActionButton, ChoiceField, ErrorBanner, PreviewNotice, RecordCard, RecordList, TextField } from "../src/features/finance/components/ui";

describe("Finance mobile accessibility", () => {
  it("labels errors, selection, pending work, and decimal keyboards", async () => {
    const view = await render(<View><TextField name="amount" label="Amount" value="bad" keyboardType="decimal-pad" onChangeText={() => undefined} error="Enter a decimal amount." /><ChoiceField label="Type" value="expense" options={[{ value: "expense", label: "Expense" }, { value: "income", label: "Income" }]} onChange={() => undefined} /><ActionButton label="Save transaction" pending onPress={() => undefined} /><ErrorBanner error={{ message: "Unable to store the transaction.", fieldErrors: {} }} /></View>);
    expect(view.getByLabelText("Amount").props).toMatchObject({ accessibilityHint: "Enter a decimal amount.", keyboardType: "decimal-pad" });
    expect(view.getByRole("radio", { name: "Type: Expense" }).props.accessibilityState.selected).toBe(true);
    expect(view.getByRole("button", { name: "Save transaction, in progress" }).props.accessibilityState).toMatchObject({ busy: true, disabled: true });
    expect(view.getByLabelText("Unable to continue. Unable to store the transaction.").props.accessibilityLiveRegion).toBe("assertive");
  });

  it("uses labelled virtualized cards and shows the credential warning", async () => {
    const title = "A deliberately long synthetic result title that remains readable on a narrow mobile screen";
    const view = await render(<View><PreviewNotice /><RecordList items={[{ id: "long", title }]} keyExtractor={(item) => item.id} accessibilityLabel="Long calculator results" renderItem={(item) => <RecordCard title={item.title} details={["12345678901234567890.123456789"]} />} /></View>);
    expect(view.getByLabelText("Long calculator results")).toBeTruthy(); expect(view.getByText(title)).toBeTruthy(); expect(view.getByText(/bank passwords, PINs, one-time codes/i)).toBeTruthy();
  });
});
