import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { featureRegistry } from "@aperture/feature-registry";
import { FinanceShell } from "@/features/finance/components/finance-shell";
import { FinanceErrorBanner, FinanceStatusBadge, FinanceTextInput } from "@/features/finance/components/ui";

vi.mock("next/navigation", () => ({ usePathname: () => "/finance" }));

describe("Finance accessibility and route surface", () => {
  it("associates field errors and exposes text status", () => {
    render(<><FinanceTextInput label="Amount" name="amount" error="Enter an exact amount." /><FinanceErrorBanner error={{ message: "Unable to save.", fieldErrors: {} }} /><FinanceStatusBadge value="active" /></>);
    expect(screen.getByLabelText("Amount").getAttribute("aria-describedby")).toBe("amount-message");
    expect(screen.getByRole("alert").textContent).toContain("Unable to save.");
    expect(screen.getByLabelText("Status: active")).toBeTruthy();
  });

  it("links every Finance route and displays the credential warning", () => {
    render(<FinanceShell><p>Content</p></FinanceShell>);
    const financeNavigation = featureRegistry.secondaryNavigation("finance", "web");
    expect(financeNavigation).toHaveLength(9);
    expect(new Set(financeNavigation.map(({ path }) => path)).size).toBe(9);
    for (const item of financeNavigation) expect(screen.getByRole("link", { name: item.label }).getAttribute("href")).toBe(item.path);
    expect(screen.getByRole("note").textContent).toContain("Never enter a bank password, PIN, OTP, or banking credential");
  });
});
