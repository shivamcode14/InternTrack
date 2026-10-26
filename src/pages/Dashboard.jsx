
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApplications } from "../context/ApplicationsContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { STATUSES } from "../constants/statuses.js";
import {
  parseLocal,
  formatDate,
  startOfToday,
  daysUntil,
} from "../utils/dates.js";

export default function Dashboard() {
  const {
    applications,
    loading,
    error,
    refreshApplications,
  } = useApplications();

  const counts = useMemo(() => {
    const result = Object.fromEntries(
      STATUSES.map((status) => [status.value, 0])
    );

    applications.forEach((application) => {
      result[application.status] =
        (result[application.status] || 0) + 1;
    });

    return result;
  }, [applications]);

  const recent = useMemo(
    () =>
      [...applications]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5),
    [applications]
  );

  // Separate overdue reminders from today and future reminders.
  const { overdue, upcoming } = useMemo(() => {
    const today = startOfToday();
    const overdueItems = [];
    const upcomingItems = [];

    const addReminder = (application, type, raw, key) => {
      const date = parseLocal(raw);

      if (!date || Number.isNaN(date.getTime())) {
        return;
      }

      // Compare calendar dates, so an interview earlier today
      // is still labelled Today instead of Overdue.
      const calendarDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const reminder = {
        key,
        date,
        raw,
        type,
        app: application,
      };

      if (calendarDate < today) {
        overdueItems.push(reminder);
      } else {
        upcomingItems.push(reminder);
      }
    };

    applications.forEach((application) => {
      addReminder(
        application,
        "Follow-up",
        application.followUpDate,
        `f${application.id}`
      );

      addReminder(
        application,
        "Interview",
        application.interviewDate,
        `i${application.id}`
      );
    });

    // Most recently overdue first; upcoming dates earliest first.
    overdueItems.sort((a, b) => b.date - a.date);
    upcomingItems.sort((a, b) => a.date - b.date);

    return {
      overdue: overdueItems.slice(0, 8),
      upcoming: upcomingItems.slice(0, 8),
    };
  }, [applications]);

  const whenLabel = (date) => {
    const days = daysUntil(date);

    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";

    return `In ${days} days`;
  };

  const renderReminder = (reminder, isOverdue = false) => {
    const days = daysUntil(reminder.date);

    let color = "#166534";
    let background = "#f0fdf4";
    let label = whenLabel(reminder.date);

    if (isOverdue) {
      color = "#b91c1c";
      background = "#fef2f2";
      label = "Overdue";
    } else if (days === 0) {
      color = "#b45309";
      background = "#fffbeb";
    } else if (days === 1) {
      color = "#1d4ed8";
      background = "#eff6ff";
    }

    return (
      <li key={reminder.key}>
        <Link
          to={`/applications/${reminder.app.id}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: ".75rem",
            width: "100%",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <div>
            <strong>
              {reminder.type} · {reminder.app.companyName}
            </strong>

            <div className="muted small">
              {reminder.app.jobTitle}
            </div>

            <div className="muted small">
              {formatDate(reminder.raw, true)}
            </div>
          </div>

          <span
            className="badge"
            style={{
              color,
              borderColor: color,
              background,
              flexShrink: 0,
            }}
          >
            {label}
          </span>
        </Link>
      </li>
    );
  };

  return (
    <section>
      <div className="row-between">
        <h1>Dashboard</h1>
        <Link
          className="btn btn-primary"
          to="/applications/new"
        >
          + Add application
        </Link>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {error && (
        <button
          className="btn btn-outline"
          onClick={refreshApplications}
        >
          Retry loading
        </button>
      )}

      {loading && (
        <p className="muted">Loading applications...</p>
      )}

      <div className="stat-grid">
        <div className="stat-card stat-total">
          <span className="stat-num">
            {applications.length}
          </span>
          <span className="stat-label">Total</span>
        </div>

        {STATUSES.map((status) => (
          <Link
            key={status.value}
            to={`/applications?status=${status.value}`}
            className="stat-card"
            style={{ borderTopColor: status.color }}
          >
            <span
              className="stat-num"
              style={{ color: status.color }}
            >
              {counts[status.value]}
            </span>
            <span className="stat-label">
              {status.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid-2 panels">
        <div className="card">
          <h2>Smart reminders</h2>

          {overdue.length === 0 && upcoming.length === 0 ? (
            <p className="muted">
              No reminders yet. Add a follow-up date or
              interview date to an application.
            </p>
          ) : (
            <>
              {overdue.length > 0 && (
                <>
                  <h3 style={{ color: "#b91c1c" }}>
                    Overdue
                  </h3>
                  <ul className="list">
                    {overdue.map((reminder) =>
                      renderReminder(reminder, true)
                    )}
                  </ul>
                </>
              )}

              {upcoming.length > 0 && (
                <>
                  <h3>Today and upcoming</h3>
                  <ul className="list">
                    {upcoming.map((reminder) =>
                      renderReminder(reminder)
                    )}
                  </ul>
                </>
              )}
            </>
          )}
        </div>

        <div className="card">
          <h2>Recently added</h2>

          {recent.length === 0 ? (
            <p className="muted">
              No applications yet.
            </p>
          ) : (
            <ul className="list">
              {recent.map((application) => (
                <li key={application.id}>
                  <div>
                    <strong>
                      {application.companyName}
                    </strong>
                    <div className="muted small">
                      {application.jobTitle}
                    </div>
                  </div>

                  <StatusBadge status={application.status} />
                </li>
              ))}
            </ul>
          )}

          <Link to="/applications">
            View all applications →
          </Link>
        </div>
      </div>
    </section>
  );
}
