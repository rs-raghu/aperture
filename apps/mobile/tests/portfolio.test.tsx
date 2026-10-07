import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { createPortfolioService, createPortfolioMemoryRepository } from "@aperture/portfolio";
import { PortfolioEditor, PortfolioProvider } from "../src/features/portfolio";
const ownerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
jest.mock("../src/lib/auth/mobile-auth-provider", () => ({ useMobileAuth: () => ({ user: null, mode: "development-bypass", supabaseClient: null }) }));
function runtime() { let sequence = 500; return { ownerId, service: createPortfolioService({ repository: createPortfolioMemoryRepository(), clock: { now: () => "2040-01-01T09:00:00.000Z" }, idGenerator: { generate: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}` } }) }; }
describe("mobile portfolio editor", () => {
  it("saves curated content and requires confirmation before preparing a snapshot", async () => {
    const value = runtime(); const view = await render(<PortfolioProvider runtime={value}><PortfolioEditor /></PortfolioProvider>); await view.findByLabelText("Display name");
    await fireEvent.changeText(view.getByLabelText("Display name"), "Synthetic professional"); await fireEvent.changeText(view.getByLabelText("Headline"), "Build useful tools"); await fireEvent.changeText(view.getByLabelText("Biography"), "Curated professional biography.");
    await fireEvent.press(view.getByRole("button", { name: "Add projects" })); await fireEvent.changeText(view.getByLabelText("Projects 1 Title"), "Synthetic project");
    await fireEvent.press(view.getByRole("button", { name: "Save private draft" })); await view.findByText("Private draft saved."); expect((await value.service.getDraft(ownerId)).content.projects[0]?.title).toBe("Synthetic project");
    await fireEvent.press(view.getByRole("button", { name: "Prepare public snapshot" })); await view.findByText(/exact owner confirmation/); expect(await value.service.readPublic(ownerId, true)).toBeNull();
    await fireEvent.changeText(view.getByLabelText("Publication confirmation"), `PUBLISH PORTFOLIO ${ownerId}`); await fireEvent.press(view.getByRole("button", { name: "Prepare public snapshot" }));
    await waitFor(async () => expect((await value.service.readPublic(ownerId, true))?.content.profile.displayName).toBe("Synthetic professional")); expect(await value.service.readPublic(ownerId, false)).toBeNull();
    await view.findByText("Curated snapshot prepared. Server publication configuration still applies."); await fireEvent.press(view.getByRole("button", { name: "Unpublish" })); await view.findByText("Public snapshot removed.");
  }, 15_000);
});
