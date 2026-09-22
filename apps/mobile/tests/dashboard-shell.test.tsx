import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";
import { MobileDashboardShell } from "../src/components/dashboard-shell";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  usePathname: () => "/education",
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("../src/generated/plugin-frontends.generated", () => ({ preloadFeatureFrontend: jest.fn() }));

describe("mobile dashboard shell", () => {
  beforeEach(() => mockPush.mockClear());

  it("renders generated navigation and routes command search results", async () => {
    const view = await render(<MobileDashboardShell><Text>Education content</Text></MobileDashboardShell>);
    expect(view.getByRole("tab", { name: "Today" })).toBeTruthy();
    expect(view.getByRole("tab", { name: "Education" })).toBeTruthy();
    expect(view.getByRole("tab", { name: "Planner" })).toBeTruthy();
    await fireEvent.press(view.getByRole("button", { name: "Search Aperture" }));
    fireEvent.changeText(await view.findByLabelText("Search routes"), "assignment");
    await fireEvent.press(await view.findByRole("link", { name: "Assignments, Education" }));
    expect(mockPush).toHaveBeenCalledWith("/education/assignments");
  });

  it("shows an explicit disabled state for an optional active feature", async () => {
    const view = await render(<MobileDashboardShell><Text>Education content</Text></MobileDashboardShell>);
    await fireEvent.press(view.getByRole("button", { name: "Search Aperture" }));
    await fireEvent.press(await view.findByRole("switch", { name: "Education feature" }));
    expect(await view.findByText("Education is disabled for this session")).toBeTruthy();
  });
});
