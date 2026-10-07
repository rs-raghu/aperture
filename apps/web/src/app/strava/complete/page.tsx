import type { Metadata } from "next";
export const metadata: Metadata = { title: "Strava connected | Aperture", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function StravaCompletePage() {
  return <main className="settings-main"><section className="panel settings-card"><h1>Strava connection complete</h1><p>Return to your dashboard or the mobile app and refresh the integration status.</p><p><a href="/strava">Open dashboard</a></p><p><a href="aperture://strava">Return to Aperture mobile</a></p></section></main>;
}
