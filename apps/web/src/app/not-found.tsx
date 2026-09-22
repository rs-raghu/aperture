import Link from "next/link";

export default function NotFound() {
  return <main className="standalone-state-page"><span className="dashboard-brand-mark" aria-hidden="true">A</span><p className="eyebrow">404</p><h1>That Aperture page does not exist</h1><p>Use the dashboard to return to a registered feature.</p><Link className="button button-primary" href="/today">Open Today</Link></main>;
}
