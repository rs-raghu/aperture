"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { financeNavigation } from "../navigation/finance-navigation";

export function FinanceShell({ children, calculatorMode = false }: { readonly children: ReactNode; readonly calculatorMode?: boolean }) {
  const pathname = usePathname();
  return <div className="finance-shell">
    <header className="finance-header">
      <Link className="finance-brand" href={calculatorMode ? "/calculators" : "/finance"} aria-label={calculatorMode ? "Aperture Calculator Hub home" : "Aperture Finance home"}>
        <span className="finance-brand-mark">A</span><span>Aperture <strong>{calculatorMode ? "Calculators" : "Finance"}</strong></span>
      </Link>
      <span className="preview-chip">Private finance</span>
    </header>
    <nav className="finance-nav" aria-label="Finance">
      {financeNavigation.map((item) => {
        const active = item.href === "/finance" ? pathname === item.href : pathname.startsWith(item.href);
        return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>{item.label}</Link>;
      })}
    </nav>
    <aside className="finance-preview-notice" role="note">
      <strong>Private workspace</strong> — Signed-in finance data is saved to the owner-scoped cloud database. Never enter a bank password, PIN, OTP, or banking credential.
    </aside>
    <main className="finance-main">{children}</main>
    <footer className="finance-footer">Private Finance workspace · exact decimal strings · no bank connection · no financial advice</footer>
  </div>;
}
