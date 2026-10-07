import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPortfolioService, createPortfolioMemoryRepository, emptyPortfolioContent, newPortfolioEntry } from "@aperture/portfolio";
import { PortfolioEditor, PortfolioProvider, PortfolioPresentation } from "@/features/portfolio";
import { isPublicPortfolioRoute } from "@/features/portfolio/route-policy";
const ownerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
function runtime() { let sequence = 500; return { ownerId, service: createPortfolioService({ repository: createPortfolioMemoryRepository(), clock: { now: () => "2040-01-01T09:00:00.000Z" }, idGenerator: { generate: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}` } }) }; }
describe("web portfolio editing and public privacy", () => {
  it("saves curated sections and explicitly prepares or removes a snapshot", async () => {
    const value = runtime(); render(<PortfolioProvider runtime={value}><PortfolioEditor /></PortfolioProvider>);
    await screen.findByLabelText("Display name");
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Synthetic professional" } });
    fireEvent.change(screen.getByLabelText("Headline"), { target: { value: "Build useful tools" } }); fireEvent.change(screen.getByLabelText("Biography"), { target: { value: "Curated professional biography." } });
    fireEvent.click(screen.getByRole("button", { name: "Add projects" })); fireEvent.change(screen.getByLabelText("Projects 1 Title"), { target: { value: "Synthetic project" } });
    fireEvent.click(screen.getByRole("button", { name: "Save private draft" })); await screen.findByText("Private draft saved.");
    expect((await value.service.getDraft(ownerId)).content.projects[0]?.title).toBe("Synthetic project"); expect(await value.service.readPublic(ownerId, true)).toBeNull();
    fireEvent.change(screen.getByLabelText("Publication confirmation"), { target: { value: `PUBLISH PORTFOLIO ${ownerId}` } }); fireEvent.click(screen.getByRole("button", { name: "Prepare public snapshot" }));
    await waitFor(async () => expect((await value.service.readPublic(ownerId, true))?.content.profile.displayName).toBe("Synthetic professional")); expect(await value.service.readPublic(ownerId, false)).toBeNull();
    await screen.findByText("Curated snapshot prepared. Server publication configuration still applies."); fireEvent.click(screen.getByRole("button", { name: "Unpublish" })); await screen.findByText("Public snapshot removed."); expect(await value.service.readPublic(ownerId, true)).toBeNull();
  });
  it("shows stale-version conflicts instead of overwriting another device's edits", async () => {
    const value = runtime(); render(<PortfolioProvider runtime={value}><PortfolioEditor /></PortfolioProvider>); await screen.findByLabelText("Display name");
    await value.service.saveDraft(ownerId, emptyPortfolioContent(), 0); fireEvent.click(screen.getByRole("button", { name: "Save private draft" })); expect((await screen.findByRole("alert")).textContent).toContain("another device");
    fireEvent.click(screen.getByRole("button", { name: "Reload saved draft" })); await screen.findByText("Latest draft loaded. Unsaved edits were replaced.");
  });
  it("renders only curated public fields and escapes user text", () => {
    const content = { ...emptyPortfolioContent(), profile: { displayName: "Synthetic professional", headline: "Build useful tools", biography: "<script>private-looking text</script>", location: "" }, educationHighlights: [{ ...newPortfolioEntry("00000000-0000-4000-8000-000000000501"), title: "Curated education achievement" }], resumeUrl: "https://example.invalid/resume.pdf" };
    const view = render(<PortfolioPresentation snapshot={{ content, publishedAt: "2040-01-01T09:00:00Z" }} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Synthetic professional"); expect(screen.getByText("Curated education achievement")).toBeTruthy();
    expect(screen.getByRole("link", { name: "View resume" }).getAttribute("href")).toBe(content.resumeUrl);
    expect(view.container.querySelector("script")).toBeNull(); expect(view.container.textContent).not.toContain(ownerId); expect(view.container.textContent).not.toContain("owner@example");
    expect(isPublicPortfolioRoute("/portfolio")).toBe(true); expect(isPublicPortfolioRoute("/portfolio/edit")).toBe(false);
  });
});
