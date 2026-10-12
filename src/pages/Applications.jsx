import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApplications } from "../context/ApplicationsContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { STATUSES, SOURCES } from "../constants/statuses.js";
import { formatDate } from "../utils/dates.js";

export default function Applications() {
  const { applications, loading, error, refreshApplications, deleteApplication } = useApplications();
  const [params, setParams] = useSearchParams();

  // Filters (Day 4). Dashboard cards link here with ?status=APPLIED
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const status = params.get("status") || "";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter(
      (a) =>
        (!q || a.companyName.toLowerCase().includes(q) || a.jobTitle.toLowerCase().includes(q)) &&
        (!status || a.status === status) &&
        (!source || a.source === source)
    );
  }, [applications, search, status, source]);

  const hasFilters = search || status || source;
  const clearFilters = () => {
    setSearch("");
    setSource("");
    setParams(new URLSearchParams(), { replace: true });
  };

  const handleStatusChange = (event) => {
    const nextStatus = event.target.value;
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (nextStatus) next.set("status", nextStatus);
      else next.delete("status");
      return next;
    });
  };

  const [actionError, setActionError] = useState("");
  const handleDelete = async (a) => {
    if (window.confirm(`Delete "${a.jobTitle}" at ${a.companyName}? This cannot be undone.`)) {
      setActionError("");
      try {
        await deleteApplication(a.id);
      } catch (requestError) {
        setActionError(requestError.message);
      }
    }
  };

  return (
    <section>
      <div className="row-between">
        <h1>Applications <span className="muted count">({filtered.length} of {applications.length})</span></h1>
        <Link className="btn btn-primary" to="/applications/new">+ Add application</Link>
      </div>

      {(error || actionError) && <p className="error" role="alert">{actionError || error}</p>}
      {error && <button className="btn btn-outline" onClick={refreshApplications}>Retry loading</button>}
      {loading && <p className="muted">Loading applications…</p>}

      <div className="filters" role="search">
        <input
          type="search"
          placeholder="Search company or job title…"
          aria-label="Search company or job title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Filter by status" value={status} onChange={handleStatusChange}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select aria-label="Filter by source" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasFilters && <button className="btn btn-outline" onClick={clearFilters}>Clear filters</button>}
      </div>

      {loading ? null : filtered.length === 0 ? (
        <div className="empty">
          <p>{applications.length === 0 ? "No applications yet." : "No applications match your search or filters."}</p>
          {hasFilters ? (
            <button className="btn btn-outline" onClick={clearFilters}>Clear filters</button>
          ) : (
            <Link className="btn btn-primary" to="/applications/new">Add your first application</Link>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th><th>Role</th><th>Status</th><th>Source</th><th>Next date</th><th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.companyName}</strong></td>
                  <td>
                    {a.jobUrl ? <a href={a.jobUrl} target="_blank" rel="noreferrer">{a.jobTitle}</a> : a.jobTitle}
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{a.source || "—"}</td>
                  <td>
                    {a.interviewDate ? <>Interview: {formatDate(a.interviewDate, true)}</>
                      : a.followUpDate ? <>Follow-up: {formatDate(a.followUpDate)}</> : "—"}
                  </td>
                  <td className="actions">
                    <Link to={`/applications/${a.id}/edit`}>Edit</Link>
                    <button className="link-danger" onClick={() => handleDelete(a)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
