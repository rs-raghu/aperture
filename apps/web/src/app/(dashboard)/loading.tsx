export default function DashboardLoading() {
  return <main className="dashboard-state-page" aria-busy="true" aria-live="polite"><div className="loading-state"><span className="spinner" aria-hidden="true" /><span>Loading your private workspace…</span></div></main>;
}
