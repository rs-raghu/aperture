"use client";

import { featureRegistry } from "@aperture/feature-registry";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function FinanceShell({ children, calculatorMode = false }: { readonly children: ReactNode; readonly calculatorMode?: boolean }) {
  const pathname = usePathname();
  const financeNavigation = featureRegistry.secondaryNavigation(calculatorMode ? "calculators" : "finance", "web");
  return <section className="finance-shell" aria-label={calculatorMode ? "Calculator workspace" : "Finance workspace"}>
    <nav className="finance-nav" aria-label="Finance">
      {financeNavigation.map((item) => {
        const active = item.path === "/finance" || item.path === "/calculators" ? pathname === item.path : pathname.startsWith(item.path);
        return <Link key={item.id} href={item.path} aria-current={active ? "page" : undefined}>{item.label}</Link>;
      })}
    </nav>
    <aside className="finance-preview-notice" role="note">
      <strong>Private workspace</strong> — Signed-in finance data is saved to the owner-scoped cloud database. Never enter a bank password, PIN, OTP, or banking credential.
    </aside>
    <main className="finance-main">{children}</main>
  </section>;
}
