import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { StravaClient, StravaClientStatus } from "@aperture/strava";
import { StravaScreen } from "../src/features/strava";
import { createMobileStravaClient, validateStravaAuthorizationUrl } from "../src/features/strava/client";
import type { MobileAuthValue } from "../src/lib/auth/mobile-auth-provider";
const mockAuth: MobileAuthValue = { loading: false, user: null, error: null, mode: "development-bypass", supabaseClient: null, signIn: jest.fn(), signOut: jest.fn() };
jest.mock("../src/lib/auth/mobile-auth-provider", () => ({ useMobileAuth: () => mockAuth }));
function fixture(mode: StravaClientStatus["mode"] = "live") {
  let snapshot: StravaClientStatus = { mode, status: { integrationId: "strava", ownerId: "synthetic-owner", status: "connected", athleteId: "101" } };
  const client: StravaClient = { status: jest.fn(async () => snapshot), connect: jest.fn(async () => "https://www.strava.com/oauth/authorize"), sync: jest.fn(async () => 2), disconnect: jest.fn(async () => { snapshot = { mode, status: { integrationId: "strava", ownerId: "synthetic-owner", status: "disconnected" } }; }) };
  return client;
}
describe("mobile Strava controls", () => {
  it("syncs, confirms deletion, and refreshes the connection status", async () => {
    const client = fixture(); const view = await render(<StravaScreen client={client} />); await view.findByText("Status: connected");
    await fireEvent.press(view.getByRole("button", { name: "Sync runs" })); await view.findByText("2 new runs imported.");
    await fireEvent(view.getByLabelText("Delete imported runs"), "valueChange", true);
    await fireEvent.changeText(view.getByLabelText("Deletion confirmation"), "DELETE STRAVA IMPORTS synthetic-owner");
    await fireEvent.press(view.getByRole("button", { name: "Disconnect Strava" }));
    await waitFor(() => expect(client.disconnect).toHaveBeenCalledWith(true, "DELETE STRAVA IMPORTS synthetic-owner")); await view.findByText("Status: disconnected");
  });
  it("shows disabled configuration and recovery from a status request failure", async () => {
    const client = fixture("disabled"); jest.mocked(client.status).mockRejectedValueOnce(new Error("Synthetic connection failure"));
    const view = await render(<StravaScreen client={client} />); await view.findByText("Synthetic connection failure");
    await fireEvent.press(view.getByRole("button", { name: "Refresh status" })); await view.findByText(/Strava is disabled on this server/);
    expect(view.getByRole("button", { name: "Connect Strava" }).props.accessibilityState.disabled).toBe(true);
  });
  it("restricts server origins and authorization destinations", () => {
    expect(() => createMobileStravaClient({ ...mockAuth, mode: "supabase" }, "http://evil.invalid")).toThrow(/HTTPS/);
    expect(() => createMobileStravaClient(mockAuth, "https://user:secret@example.invalid")).toThrow(/HTTPS/);
    expect(() => validateStravaAuthorizationUrl("https://evil.invalid/oauth", "https://aperture.example.invalid")).toThrow();
    expect(validateStravaAuthorizationUrl("https://www.strava.com/oauth/authorize", "https://aperture.example.invalid")).toContain("strava.com");
  });
});
