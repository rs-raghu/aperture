"use client";

import { featureRegistry } from "@aperture/feature-registry";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const healthNavigation = featureRegistry.secondaryNavigation("health", "web");

export function HealthShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  return (
    <section className="health-shell" aria-label="Health workspace">
      <nav className="health-nav" aria-label="Health">
        {healthNavigation.map((item) => {
          const active = item.path === "/health" ? pathname === item.path : pathname.startsWith(item.path);
          return <Link key={item.id} href={item.path} aria-current={active ? "page" : undefined}>{item.label}</Link>;
        })}
      </nav>
      <aside className="health-preview-notice" role="note">
        <strong>Private workspace</strong> — Signed-in health data is saved to the owner-scoped cloud database. It is a personal record, not medical advice.
      </aside>
      <main className="health-main">{children}</main>
    </section>
  );
}
