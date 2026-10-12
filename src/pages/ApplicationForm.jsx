import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApplications } from "../context/ApplicationsContext.jsx";
import Field from "../components/Field.jsx";
import { STATUSES, SOURCES } from "../constants/statuses.js";
import { validateApplication, findDuplicate } from "../utils/validation.js";

const EMPTY = {
  companyName: "", jobTitle: "", jobUrl: "", source: "", status: "SAVED",
  applicationDate: "", followUpDate: "", interviewDate: "", notes: "",
};

export default function ApplicationForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const {
    applications,
    loading,
    error: loadError,
    refreshApplications,
    addApplication,
    updateApplication,
    getApplication,
  } = useApplications();

  const existing = isEdit ? getApplication(id) : null;
  const [values, setValues] = useState(existing ? {
    ...EMPTY,
    ...existing,
    jobUrl: existing.jobUrl || "",
    source: existing.source || "",
    applicationDate: existing.applicationDate || "",
    followUpDate: existing.followUpDate || "",
    interviewDate: existing.interviewDate ? existing.interviewDate.slice(0, 16) : "",
    notes: existing.notes || "",
  } : EMPTY);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    if (existing) {
      setValues({
        ...EMPTY,
        ...existing,
        jobUrl: existing.jobUrl || "",
        source: existing.source || "",
        applicationDate: existing.applicationDate || "",
        followUpDate: existing.followUpDate || "",
        interviewDate: existing.interviewDate ? existing.interviewDate.slice(0, 16) : "",
        notes: existing.notes || "",
      });
    }
  }, [existing]);

  if (loading) return <p className="muted">Loading applications…</p>;
  if (loadError) {
    return (
      <section>
        <p className="error" role="alert">{loadError}</p>
        <button className="btn btn-outline" onClick={refreshApplications}>Retry loading</button>
      </section>
    );
  }
  if (isEdit && !existing) {
    return (
      <section>
        <h1>Application not found</h1>
        <p className="muted">It may have been deleted.</p>
        <Link className="btn btn-primary" to="/applications">Back to applications</Link>
      </section>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined })); // clear error as user fixes it
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRequestError("");
    const found = validateApplication(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    const clean = {
      ...values,
      companyName: values.companyName.trim(),
      jobTitle: values.jobTitle.trim(),
      jobUrl: values.jobUrl.trim(),
      applicationDate: values.applicationDate || null,
      followUpDate: values.followUpDate || null,
      interviewDate: values.interviewDate || null,
    };
    try {
      if (isEdit) await updateApplication(existing.id, clean);
      else await addApplication(clean);
      navigate("/applications");
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setRequestError(error.message);
    }
  };

  const duplicate = findDuplicate(values.jobUrl, applications, existing ? existing.id : null);

  return (
    <section>
      <h1>{isEdit ? "Edit application" : "Add application"}</h1>
      <form className="card form" onSubmit={handleSubmit} noValidate>
        {requestError && <p className="error" role="alert">{requestError}</p>}
        <div className="grid-2">
          <Field label="Company name" name="companyName" value={values.companyName} onChange={handleChange} error={errors.companyName} required maxLength={200} />
          <Field label="Job title" name="jobTitle" value={values.jobTitle} onChange={handleChange} error={errors.jobTitle} required maxLength={200} />
        </div>

        <Field label="Job link" name="jobUrl" type="url" value={values.jobUrl} onChange={handleChange} error={errors.jobUrl} placeholder="https://…" />
        {duplicate && (
          <p className="warning" role="status">
            Heads up: you already saved this link ({duplicate.jobTitle} at {duplicate.companyName}). You can still save it.
          </p>
        )}

        <div className="grid-2">
          <Field as="select" label="Source" name="source" value={values.source} onChange={handleChange} error={errors.source}>
            <option value="">Select source</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Field>
          <Field as="select" label="Status" name="status" value={values.status} onChange={handleChange} required
            hint="Use Saved if you only bookmarked it. Choose Applied after you submit.">
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Field>
        </div>

        <div className="grid-3">
          <Field label="Application date" name="applicationDate" type="date" value={values.applicationDate} onChange={handleChange} error={errors.applicationDate} />
          <Field label="Follow-up date" name="followUpDate" type="date" value={values.followUpDate} onChange={handleChange} error={errors.followUpDate} />
          <Field label="Interview date & time" name="interviewDate" type="datetime-local" value={values.interviewDate} onChange={handleChange} error={errors.interviewDate} />
        </div>

        <Field as="textarea" rows={4} label="Notes" name="notes" value={values.notes} onChange={handleChange} error={errors.notes}
          hint={`${values.notes.length}/1000`} />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">{isEdit ? "Save changes" : "Add application"}</button>
          <Link className="btn btn-outline" to="/applications">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
