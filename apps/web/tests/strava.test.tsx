import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { StravaClient, StravaClientStatus } from "@aperture/strava";
import { StravaScreen } from "@/features/strava";
import { delegatesStravaAuthentication } from "@/features/strava/route-policy";
function fixture(mode: StravaClientStatus["mode"] = "live") {
  let snapshot: StravaClientStatus = { mode, status: { integrationId: "strava", ownerId: "synthetic-owner", status: "connected", athleteId: "101" } };
  const client: StravaClient = { status: vi.fn(async () => snapshot), connect: vi.fn(async () => "https://www.strava.com/oauth/authorize"), sync: vi.fn(async () => 2), disconnect: vi.fn(async () => { snapshot = { mode, status: { integrationId: "strava", ownerId: "synthetic-owner", status: "disconnected" } }; }) };
  return client;
}
describe("web Strava controls", () => {
  it("syncs and sends an explicit deletion choice and owner confirmation", async () => {
    const client = fixture(); render(<StravaScreen client={client} />);
    await screen.findByText("connected"); fireEvent.click(screen.getByRole("button", { name: "Sync runs" })); await screen.findByText("2 new runs imported.");
    fireEvent.click(screen.getByLabelText("Delete imported runs when disconnecting"));
    fireEvent.change(screen.getByLabelText("Deletion confirmation"), { target: { value: "DELETE STRAVA IMPORTS synthetic-owner" } });
    fireEvent.click(screen.getByRole("button", { name: "Disconnect Strava" }));
    await waitFor(() => expect(client.disconnect).toHaveBeenCalledWith(true, "DELETE STRAVA IMPORTS synthetic-owner"));
    await screen.findByText("disconnected");
  });
  it("shows the disabled state without allowing provider operations", async () => {
    render(<StravaScreen client={fixture("disabled")} />); await screen.findByText(/Strava is disabled on this server/);
    expect(screen.getByRole("button", { name: "Connect Strava" })).toHaveProperty("disabled", true);
  });
  it("shows recoverable network errors and permits refreshing status", async () => {
    const client = fixture(); vi.mocked(client.status).mockRejectedValueOnce(new Error("Synthetic connection failure"));
    render(<StravaScreen client={client} />); expect((await screen.findByRole("alert")).textContent).toContain("Synthetic connection failure");
    // A failed initial request must not permanently disable the recovery action.
    fireEvent.click(screen.getByRole("button", { name: "Refresh status" })); await screen.findByText("connected");
  });
  it("delegates only owned API and completion routes", () => {
    expect(delegatesStravaAuthentication("/api/integrations/strava/webhook")).toBe(true);
    expect(delegatesStravaAuthentication("/api/integrations/strava/unknown")).toBe(false);
    expect(delegatesStravaAuthentication("/strava")).toBe(false);
  });
});
