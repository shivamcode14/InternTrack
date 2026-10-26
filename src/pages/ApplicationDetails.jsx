
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApplications } from "../context/ApplicationsContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDate } from "../utils/dates.js";

function Detail({ label, children }) {
  return (
    <div className="field">
      <span className="muted small">{label}</span>
      <div>{children || "—"}</div>
    </div>
  );
}

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    getApplication,
    loading,
    error,
    refreshApplications,
    deleteApplication,
  } = useApplications();

  const [actionError, setActionError] = useState("");
  const application = getApplication(id);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${application.jobTitle}" at ${application.companyName}? This cannot be undone.`
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await deleteApplication(application.id);
      navigate("/applications", { replace: true });
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  if (loading) {
    return <p className="muted">Loading application details...</p>;
  }

  if (error) {
    return (
      <section>
        <p className="error" role="alert">{error}</p>
        <button className="btn btn-outline" onClick={refreshApplications}>
          Retry loading
        </button>
      </section>
    );
  }

  if (!application) {
    return (
      <section>
        <h1>Application not found</h1>
        <p className="muted">
          This application may have been deleted or may not exist.
        </p>
        <Link className="btn btn-primary" to="/applications">
          Back to applications
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="row-between">
        <div>
          <Link to="/applications">← All applications</Link>
          <h1 style={{ marginTop: "0.75rem" }}>
            {application.companyName}
          </h1>
          <p className="muted">{application.jobTitle}</p>
        </div>

        <div className="form-actions">
          <Link
            className="btn btn-outline"
            to={`/applications/${application.id}/edit`}
          >
            Edit application
          </Link>

          <button className="btn link-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {actionError && (
        <p className="error" role="alert">{actionError}</p>
      )}

      <div className="card">
        <h2>Application information</h2>

        <div className="grid-2">
          <Detail label="Company">{application.companyName}</Detail>
          <Detail label="Job title">{application.jobTitle}</Detail>

          <Detail label="Status">
            <StatusBadge status={application.status} />
          </Detail>

          <Detail label="Source">{application.source}</Detail>

          <Detail label="Application date">
            {formatDate(application.applicationDate)}
          </Detail>

          <Detail label="Follow-up date">
            {formatDate(application.followUpDate)}
          </Detail>

          <Detail label="Interview date & time">
            {formatDate(application.interviewDate, true)}
          </Detail>

          <Detail label="Job link">
            {application.jobUrl ? (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open job posting
              </a>
            ) : null}
          </Detail>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2>Notes</h2>
        <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {application.notes || "No notes added yet."}
        </p>
      </div>
    </section>
  );
}
