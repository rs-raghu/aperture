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
        <span className="preview-chip">Private education</span>
      </header>
      <nav className="education-nav" aria-label="Education">
        {educationNavigation.map((item) => {
          const active = item.href === "/education" ? pathname === item.href : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>{item.label}</Link>;
        })}
      </nav>
      <aside className="preview-notice" role="note">
        <strong>Private workspace</strong> — Signed-in data is saved to the owner-scoped cloud database. Explicit development previews use temporary memory.
      </aside>
      <main className="education-main">{children}</main>
      <footer className="education-footer">Private Education workspace · owner scoped · cloud synchronized</footer>
    </div>
  );
}
