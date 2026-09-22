"use client";

import { featureRegistry } from "@aperture/feature-registry";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const educationNavigation = featureRegistry.secondaryNavigation("education", "web");

export function EducationShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  return (
    <section className="education-shell" aria-label="Education workspace">
      <nav className="education-nav" aria-label="Education">
        {educationNavigation.map((item) => {
          const active = item.path === "/education" ? pathname === item.path : pathname.startsWith(item.path);
          return <Link key={item.id} href={item.path} aria-current={active ? "page" : undefined}>{item.label}</Link>;
        })}
      </nav>
      <aside className="preview-notice" role="note">
        <strong>Private workspace</strong> — Signed-in data is saved to the owner-scoped cloud database. Explicit development previews use temporary memory.
      </aside>
      <main className="education-main">{children}</main>
    </section>
  );
}
