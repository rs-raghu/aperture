import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HealthShell } from "@/features/health/components/health-shell";
import { ErrorBanner, StatusBadge, TextInput, toIsoTimestamp } from "@/features/health/components/ui";
import { healthNavigation } from "@/features/health/navigation/health-navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/health" }));

describe("Health web accessibility and route surface", () => {
  it("normalizes explicit offsets at the presentation boundary and preserves invalid input for validation", () => {
    expect(toIsoTimestamp("2040-01-01T05:30:00+05:30")).toBe("2040-01-01T00:00:00.000Z");
    expect(toIsoTimestamp("invalid timestamp")).toBe("invalid timestamp");
  });

  it("associates field errors, announces failures, and labels status text", () => {
    render(<>
      <TextInput label="Observed value" name="observedValue" error="Enter a valid observation." />
      <ErrorBanner error={{ message: "Unable to store the observation.", fieldErrors: {} }} />
      <StatusBadge value="in_progress" />
    </>);

    const input = screen.getByRole("textbox", { name: "Observed value" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("observedValue-message");
    expect(screen.getByRole("alert").textContent).toContain("Unable to store the observation.");
    expect(screen.getByLabelText("Status: in progress").textContent).toBe("in progress");
  });

  it("exposes every unique Health route in labelled navigation with a visible safety notice", () => {
    render(<HealthShell><p>Route content</p></HealthShell>);
    expect(screen.getByRole("navigation", { name: "Health" })).toBeTruthy();
    expect(screen.getByRole("note").textContent).toContain("not medical advice");
    expect(healthNavigation).toHaveLength(10);
    expect(new Set(healthNavigation.map((item) => item.href)).size).toBe(10);
    for (const item of healthNavigation) {
      expect(screen.getByRole("link", { name: item.label }).getAttribute("href")).toBe(item.href);
    }
  });
});
