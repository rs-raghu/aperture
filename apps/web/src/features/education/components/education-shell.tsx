"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { educationNavigation } from "../navigation/education-navigation";

export function EducationShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="education-shell">
      <header className="education-header">
        <Link className="education-brand" href="/education" aria-label="Aperture Education home">
          <span className="brand-mark">A</span><span>Aperture <strong>Education</strong></span>
        </Link>
        <span className="preview-chip">Phase 9 preview</span>
      </header>
      <nav className="education-nav" aria-label="Education">
        {educationNavigation.map((item) => {
          const active = item.href === "/education" ? pathname === item.href : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>{item.label}</Link>;
        })}
      </nav>
      <aside className="preview-notice" role="note">
        <strong>Development preview</strong> — Education data is stored in memory and resets when the page is refreshed. The temporary owner identity is not authentication.
      </aside>
      <main className="education-main">{children}</main>
      <footer className="education-footer">Local Education preview · no durable storage · no personal data</footer>
    </div>
  );
}
