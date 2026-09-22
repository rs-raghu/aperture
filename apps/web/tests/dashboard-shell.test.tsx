import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebDashboardShell } from "@/components/dashboard-shell";

let pathname = "/education";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("@/generated/plugin-frontends.generated", () => ({ preloadFeatureFrontend: vi.fn() }));

describe("web dashboard shell", () => {
  beforeEach(() => { pathname = "/education"; });

  it("renders generated primary navigation and searches generated routes", async () => {
    const user = userEvent.setup();
    render(<WebDashboardShell><main>Education content</main></WebDashboardShell>);
    expect(screen.getByRole("navigation", { name: "Primary navigation" }).textContent).toContain("TodayEducationHealthFinancePlannerCalculatorsSettings");
    await user.click(screen.getByRole("button", { name: /Search/ }));
    await user.type(screen.getByRole("textbox", { name: "Search routes" }), "assignment");
    const result = screen.getByRole("link", { name: /Assignments/ });
    expect(result.getAttribute("href")).toBe("/education/assignments");
  });

  it("supports command-palette feature enablement without hiding required features", async () => {
    const user = userEvent.setup();
    render(<WebDashboardShell><main>Education content</main></WebDashboardShell>);
    await user.click(screen.getByRole("button", { name: /Search/ }));
    await user.click(screen.getByRole("button", { name: "Disable Education" }));
    expect(screen.getByRole("heading", { name: "Education is disabled for this session" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Today/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Settings/ }).length).toBeGreaterThan(0);
  });
});
