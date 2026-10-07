"use client";

import { featureRegistry } from "@aperture/feature-registry";
import type { UpdateSettingsInput, UserSettings } from "@aperture/settings";
import { useSettings } from "./provider";

function Toggle({ label, checked, locked = false, onChange }: { readonly label: string; readonly checked: boolean; readonly locked?: boolean; readonly onChange: (checked: boolean) => void }) {
  return <label className="settings-toggle"><span>{label}{locked ? <small>Required</small> : null}</span><input type="checkbox" checked={checked} disabled={locked} onChange={(event) => onChange(event.target.checked)} /></label>;
}

export function SettingsScreen() {
  const { snapshot, loading, error, update, updatePlatform } = useSettings();
  if (loading) return <main className="settings-main"><div className="loading-state" role="status">Loading settings…</div></main>;
  if (error || snapshot === null) return <main className="settings-main"><div className="error-banner" role="alert">{error ?? "Settings are unavailable."}</div></main>;
  const settings = snapshot.preferences;
  const save = (input: UpdateSettingsInput) => { void update(input).catch(() => undefined); };
  const select = (label: string, value: string, options: readonly string[], onChange: (value: string) => void) => <label className="field"><span>{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  return <main className="settings-main">
    <header className="page-header"><div><p className="eyebrow">Settings & privacy</p><h1>Shape your private workspace</h1><p>Portable choices sync through your owner-scoped record. Device-only behavior stays isolated by platform.</p></div><div><span className="status-badge">Saved automatically</span><p><a href="/settings/data">Data & recovery</a></p></div></header>
    <section className="settings-grid">
      <article className="panel settings-card"><div className="panel-heading"><h2>Appearance & region</h2><p>Formatting and defaults shared by web and mobile.</p></div><div className="settings-fields">
        {select("Theme", settings.theme, ["system", "light", "dark"], (value) => save({ theme: value as UserSettings["theme"] }))}
        <label className="field"><span>Locale</span><input aria-label="Locale" defaultValue={settings.locale} onBlur={(event) => save({ locale: event.target.value })} /></label>
        <label className="field"><span>Timezone</span><input aria-label="Timezone" defaultValue={settings.timeZone} onBlur={(event) => save({ timeZone: event.target.value })} /></label>
        <label className="field"><span>Currency</span><input aria-label="Currency" maxLength={3} defaultValue={settings.currency} onBlur={(event) => save({ currency: event.target.value })} /></label>
        {select("Date format", settings.dateFormat, ["locale-default", "day-month-year", "month-day-year", "year-month-day"], (value) => save({ dateFormat: value as UserSettings["dateFormat"] }))}
        {select("Week starts", settings.weekStartDay, ["monday", "sunday"], (value) => save({ weekStartDay: value as UserSettings["weekStartDay"] }))}
      </div></article>
      <article className="panel settings-card"><div className="panel-heading"><h2>Units & planning</h2><p>Explicit units prevent ambiguous health and finance entries.</p></div><div className="settings-fields">
        {select("Measurement system", settings.units.measurementSystem, ["metric", "imperial"], (value) => save({ units: { measurementSystem: value as UserSettings["units"]["measurementSystem"] } }))}
        {select("Temperature", settings.units.temperatureUnit, ["celsius", "fahrenheit"], (value) => save({ units: { temperatureUnit: value as UserSettings["units"]["temperatureUnit"] } }))}
        {select("Distance", settings.units.distanceUnit, ["kilometres", "miles"], (value) => save({ units: { distanceUnit: value as UserSettings["units"]["distanceUnit"] } }))}
        {select("Mass", settings.units.massUnit, ["kilograms", "pounds"], (value) => save({ units: { massUnit: value as UserSettings["units"]["massUnit"] } }))}
        <label className="field"><span>Fiscal year start month</span><input aria-label="Fiscal year start month" type="number" min="1" max="12" defaultValue={settings.fiscalYear.startMonth} onBlur={(event) => save({ fiscalYear: { startMonth: Number(event.target.value) } })} /></label>
        <label className="field"><span>Fiscal year start day</span><input aria-label="Fiscal year start day" type="number" min="1" max="31" defaultValue={settings.fiscalYear.startDay} onBlur={(event) => save({ fiscalYear: { startDay: Number(event.target.value) } })} /></label>
        <label className="field"><span>GPA scale</span><input aria-label="GPA scale" type="number" min="1" max="100" defaultValue={settings.gpaScale} onBlur={(event) => save({ gpaScale: Number(event.target.value) })} /></label>
      </div></article>
      <article className="panel settings-card"><div className="panel-heading"><h2>Calculator defaults</h2><p>Reusable assumptions remain editable for every calculation.</p></div><div className="settings-fields">
        <label className="field"><span>Inflation rate (%)</span><input aria-label="Inflation rate" type="number" step="0.1" defaultValue={String(settings.calculatorDefaults.inflationRate ?? 6)} onBlur={(event) => save({ calculatorDefaults: { inflationRate: Number(event.target.value) } })} /></label>
        <label className="field"><span>Expected return (%)</span><input aria-label="Expected return" type="number" step="0.1" defaultValue={String(settings.calculatorDefaults.expectedReturnRate ?? 10)} onBlur={(event) => save({ calculatorDefaults: { expectedReturnRate: Number(event.target.value) } })} /></label>
      </div></article>
      <article className="panel settings-card"><div className="panel-heading"><h2>Privacy controls</h2><p>Optional collection is off by default.</p></div><div className="settings-toggles">
        <Toggle label="Usage analytics" checked={settings.privacy.usageAnalytics} onChange={(value) => save({ privacy: { usageAnalytics: value } })} />
        <Toggle label="Crash reports" checked={settings.privacy.crashReports} onChange={(value) => save({ privacy: { crashReports: value } })} />
        <Toggle label="Personalized insights" checked={settings.privacy.personalizedInsights} onChange={(value) => save({ privacy: { personalizedInsights: value } })} />
        <Toggle label="Integration data sharing" checked={settings.privacy.integrationDataSharing} onChange={(value) => save({ privacy: { integrationDataSharing: value } })} />
      </div></article>
      <article className="panel settings-card"><div className="panel-heading"><h2>Features</h2><p>Hiding a workspace never deletes its records.</p></div><div className="settings-toggles">{featureRegistry.listFeatures().map((feature) => <Toggle key={feature.id} label={feature.displayName} locked={!feature.disableAllowed} checked={feature.disableAllowed ? settings.featureEnablement[feature.id] ?? feature.defaultEnabled : true} onChange={(value) => save({ featureEnablement: { [feature.id]: value } })} />)}</div></article>
      <article className="panel settings-card"><div className="panel-heading"><h2>Today widgets</h2><p>Choose the contributions shown on the daily dashboard.</p></div><div className="settings-toggles">{featureRegistry.widgets("web").map((widget) => <Toggle key={widget.id} label={widget.title} checked={settings.dashboardWidgets[widget.id] ?? widget.defaultEnabled} onChange={(value) => save({ dashboardWidgets: { [widget.id]: value } })} />)}</div></article>
      <article className="panel settings-card"><div className="panel-heading"><h2>Web-only behavior</h2><p>These choices do not change the mobile layout.</p></div><div className="settings-toggles"><Toggle label="Compact navigation" checked={settings.platform.web.compactNavigation} onChange={(value) => { void updatePlatform({ compactNavigation: value }).catch(() => undefined); }} /><Toggle label="Reduce motion" checked={settings.platform.web.reduceMotion} onChange={(value) => { void updatePlatform({ reduceMotion: value }).catch(() => undefined); }} /></div></article>
      <article className="panel settings-card"><div className="panel-heading"><h2>Integrations</h2><p>Only connection health is exposed here. Credentials remain server-only.</p></div>{snapshot.integrations.length === 0 ? <div className="empty-state"><h3>No integrations connected</h3><p>Optional providers will appear here when configured.</p></div> : <ul className="record-list">{snapshot.integrations.map((integration) => <li className="record-card" key={integration.id}><div><h3>{integration.integrationId}</h3><p>{integration.lastSynchronizedAt ? `Last synced ${integration.lastSynchronizedAt}` : "Not synchronized yet"}</p></div><span className="status-badge">{integration.status}</span></li>)}</ul>}</article>
    </section>
  </main>;
}
