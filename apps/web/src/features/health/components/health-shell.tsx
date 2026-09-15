"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { healthNavigation } from "../navigation/health-navigation";

export function HealthShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="health-shell">
      <header className="health-header">
        <Link className="health-brand" href="/health" aria-label="Aperture Health home">
          <span className="health-brand-mark">A</span><span>Aperture <strong>Health</strong></span>
        </Link>
        <span className="preview-chip">Health preview</span>
      </header>
      <nav className="health-nav" aria-label="Health">
        {healthNavigation.map((item) => {
          const active = item.href === "/health" ? pathname === item.href : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>{item.label}</Link>;
        })}
      </nav>
      <aside className="health-preview-notice" role="note">
        <strong>Development preview</strong> — Health data stays in memory and resets on full refresh. The synthetic owner is a test identity, not authentication. Do not enter personal health data.
      </aside>
      <main className="health-main">{children}</main>
      <footer className="health-footer">Local Health preview · no diagnosis · no durable storage · synthetic data only</footer>
    </div>
  );
}
