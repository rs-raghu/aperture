"use client";

import { featureRegistry, type FeatureEnablementOverrides, type FeatureId } from "@aperture/feature-registry";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { preloadFeatureFrontend } from "@/generated/plugin-frontends.generated";

function routeIsActive(pathname: string, path: string): boolean {
  return pathname === path || path !== "/" && pathname.startsWith(`${path}/`);
}

export function WebDashboardShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const [overrides, setOverrides] = useState<FeatureEnablementOverrides>({});
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigation = featureRegistry.navigation("web", overrides);
  const searchResults = useMemo(() => featureRegistry.search(query, "web", overrides), [query, overrides]);
  const activeRoute = featureRegistry.findRoute("web", pathname);
  const activeFeature = activeRoute ? featureRegistry.getFeature(activeRoute.featureId) : undefined;
  const activeFeatureEnabled = activeFeature ? featureRegistry.isEnabled(activeFeature.id, overrides) : true;
  const themeStyle = activeFeature ? {
    "--shell-accent": activeFeature.theme.accent,
    "--shell-accent-surface": activeFeature.theme.surface,
  } as CSSProperties : undefined;

  const toggleFeature = (featureId: FeatureId) => {
    const feature = featureRegistry.getFeature(featureId);
    if (!feature?.disableAllowed) return;
    setOverrides((current) => {
      const next = { ...current, [featureId]: !featureRegistry.isEnabled(featureId, current) };
      return next;
    });
  };

  return (
    <div className="dashboard-shell" style={themeStyle}>
      <a className="skip-link" href="#dashboard-content">Skip to content</a>
      <header className="dashboard-header">
        <Link className="dashboard-brand" href="/today" aria-label="Aperture dashboard home">
          <span className="dashboard-brand-mark" aria-hidden="true">A</span>
          <span><strong>Aperture</strong><small>Personal dashboard</small></span>
        </Link>
        <nav className="dashboard-desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => <Link key={item.id} href={item.path} aria-current={routeIsActive(pathname, item.path) ? "page" : undefined} onMouseEnter={() => preloadFeatureFrontend(item.featureId as FeatureId)} onFocus={() => preloadFeatureFrontend(item.featureId as FeatureId)}>{item.label}</Link>)}
        </nav>
        <div className="dashboard-header-actions">
          <button className="dashboard-search-button" type="button" onClick={() => setPaletteOpen(true)} aria-haspopup="dialog"><span aria-hidden="true">⌕</span><span>Search</span><kbd>Ctrl K</kbd></button>
          <button className="dashboard-menu-button" type="button" onClick={() => setMobileNavigationOpen((open) => !open)} aria-expanded={mobileNavigationOpen} aria-controls="dashboard-mobile-nav"><span aria-hidden="true">☰</span><span className="sr-only">Menu</span></button>
        </div>
      </header>
      <nav id="dashboard-mobile-nav" className="dashboard-mobile-nav" aria-label="Mobile navigation" data-open={mobileNavigationOpen || undefined}>
        {navigation.map((item) => <Link key={item.id} href={item.path} aria-current={routeIsActive(pathname, item.path) ? "page" : undefined} onClick={() => setMobileNavigationOpen(false)}>{item.label}</Link>)}
      </nav>
      <div id="dashboard-content" className="dashboard-content" tabIndex={-1}>
        {activeFeature && !activeFeatureEnabled ? (
          <main className="dashboard-state-page">
            <p className="eyebrow">Feature paused</p>
            <h1>{activeFeature.displayName} is disabled for this session</h1>
            <p>Your saved data is unchanged. Re-enable the feature to return to its workspace.</p>
            <button className="button button-primary" type="button" onClick={() => toggleFeature(activeFeature.id as FeatureId)}>Enable {activeFeature.displayName}</button>
          </main>
        ) : children}
      </div>
      <footer className="dashboard-global-footer">Aperture · private owner-scoped workspace</footer>
      {paletteOpen ? (
        <div className="command-backdrop" role="presentation" onMouseDown={() => setPaletteOpen(false)}>
          <section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="command-heading">
              <div><p className="eyebrow">Navigate</p><h2 id="command-title">Search Aperture</h2></div>
              <button type="button" className="command-close" onClick={() => setPaletteOpen(false)} aria-label="Close search">×</button>
            </div>
            <label className="command-input"><span className="sr-only">Search routes</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search features and pages…" /></label>
            <div className="command-results" aria-live="polite">
              {searchResults.length === 0 ? <p className="command-empty">No matching page.</p> : searchResults.map((result) => <Link key={result.id} href={result.path} onClick={() => { setPaletteOpen(false); setQuery(""); }}><span><strong>{result.label}</strong><small>{result.featureName} · {result.description}</small></span><span aria-hidden="true">↗</span></Link>)}
            </div>
            <div className="command-feature-toggles">
              <p>Session feature visibility</p>
              {featureRegistry.listFeatures().filter(({ disableAllowed }) => disableAllowed).map((feature) => {
                const enabled = featureRegistry.isEnabled(feature.id, overrides);
                return <button key={feature.id} type="button" onClick={() => toggleFeature(feature.id as FeatureId)} aria-label={`${enabled ? "Disable" : "Enable"} ${feature.displayName}`} aria-pressed={enabled}><span>{feature.displayName}</span><span>{enabled ? "On" : "Off"}</span></button>;
              })}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
