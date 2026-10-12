import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApplications } from "../context/ApplicationsContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { STATUSES } from "../constants/statuses.js";
import { parseLocal, formatDate, startOfToday, daysUntil } from "../utils/dates.js";

export default function Dashboard() {
  const { applications, loading, error, refreshApplications } = useApplications();

  // Counts per status (Day 5)
  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUSES.map((s) => [s.value, 0]));
    applications.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [applications]);

  // Most recently added = highest id
  const recent = useMemo(() => [...applications].sort((a, b) => b.id - a.id).slice(0, 5), [applications]);

  // Upcoming follow-ups + interviews (today or later), soonest first
  const upcoming = useMemo(() => {
    const today = startOfToday();
    const items = [];
    applications.forEach((a) => {
      const f = parseLocal(a.followUpDate);
      if (f && f >= today) items.push({ key: `f${a.id}`, date: f, raw: a.followUpDate, type: "Follow-up", app: a });
      const i = parseLocal(a.interviewDate);
      if (i && i >= today) items.push({ key: `i${a.id}`, date: i, raw: a.interviewDate, type: "Interview", app: a });
    });
    return items.sort((x, y) => x.date - y.date).slice(0, 8);
  }, [applications]);

  const whenLabel = (date) => {
    const d = daysUntil(date);
    if (d === 0) return "Today";
    if (d === 1) return "Tomorrow";
    return `In ${d} days`;
  };

  return (
    <section>
      <div className="row-between">
        <h1>Dashboard</h1>
        <Link className="btn btn-primary" to="/applications/new">+ Add application</Link>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {error && <button className="btn btn-outline" onClick={refreshApplications}>Retry loading</button>}
      {loading && <p className="muted">Loading applications…</p>}

      <div className="stat-grid">
        <div className="stat-card stat-total">
          <span className="stat-num">{applications.length}</span>
          <span className="stat-label">Total</span>
        </div>
        {STATUSES.map((s) => (
          <Link key={s.value} to={`/applications?status=${s.value}`} className="stat-card" style={{ borderTopColor: s.color }}>
            <span className="stat-num" style={{ color: s.color }}>{counts[s.value]}</span>
            <span className="stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid-2 panels">
        <div className="card">
          <h2>Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="muted">Nothing coming up. Add a follow-up or interview date to an application.</p>
          ) : (
            <ul className="list">
              {upcoming.map((u) => (
                <li key={u.key}>
                  <div>
                    <strong>{u.type}</strong> · {u.app.companyName}
                    <div className="muted small">{u.app.jobTitle}</div>
                  </div>
                  <div className="when">
                    <div>{formatDate(u.raw, true)}</div>
                    <div className="muted small">{whenLabel(u.date)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Recently added</h2>
          {recent.length === 0 ? (
            <p className="muted">No applications yet.</p>
          ) : (
            <ul className="list">
              {recent.map((a) => (
                <li key={a.id}>
                  <div>
                    <strong>{a.companyName}</strong>
                    <div className="muted small">{a.jobTitle}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
          <Link to="/applications">View all applications →</Link>
        </div>
      </div>
    </section>
  );
}
