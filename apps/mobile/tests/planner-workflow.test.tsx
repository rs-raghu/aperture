import { createPlannerMemoryRepository, createPlannerService } from "@aperture/planner";
import { fireEvent, render } from "@testing-library/react-native";
import { PlannerProvider } from "../src/features/planner/providers/planner-provider";
import { PlannerScreen } from "../src/features/planner/screens/planner-screen";

const ownerId = "00000000-0000-4000-8000-000000000001";
const now = () => "2040-03-06T10:00:00.000Z";

describe("Planner mobile workflow", () => {
  it("creates and completes owner-scoped daily work", async () => {
    let next = 1;
    const service = createPlannerService({ repository: createPlannerMemoryRepository(), clock: { now }, idGenerator: { generate: () => `00000000-0000-4000-8000-${String(next++).padStart(12, "0")}` } });
    const view = await render(<PlannerProvider runtime={{ service, context: { ownerId }, clock: { now } }}><PlannerScreen /></PlannerProvider>);
    await view.findByText("Nothing planned for this date.");
    await fireEvent.changeText(view.getByLabelText("Planner item title"), "Mobile plan");
    await fireEvent.press(view.getByRole("button", { name: "Add item" }));
    await view.findByText("Mobile plan");
    await fireEvent.press(view.getByRole("button", { name: "Done" }));
    expect(await view.findByRole("button", { name: "Reopen" })).toBeTruthy();
  }, 15_000);
});
