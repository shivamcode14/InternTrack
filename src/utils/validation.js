const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeUrl(value) {
  try {
    const u = new URL(value.trim());
    return (u.origin + u.pathname).replace(/\/+$/, "").toLowerCase();
  } catch {
    return "";
  }
}

// Returns an object of { fieldName: "message" }. Empty object = valid.
export function validateApplication(v) {
  const e = {};
  if (!v.companyName.trim()) e.companyName = "Company name is required.";
  else if (v.companyName.trim().length > 150) e.companyName = "Company name must be 150 characters or fewer.";

  if (!v.jobTitle.trim()) e.jobTitle = "Job title is required.";
  else if (v.jobTitle.trim().length > 180) e.jobTitle = "Job title must be 180 characters or fewer.";

  if (v.jobUrl.trim() && !isHttpUrl(v.jobUrl.trim())) e.jobUrl = "Enter a valid link starting with http:// or https://";

  if (v.status !== "SAVED" && !v.applicationDate) e.applicationDate = "Add the date you applied (only 'Saved' can skip it).";

  if (v.notes.length > 1000) e.notes = "Notes must be 1000 characters or fewer.";
  return e;
}

// Warning only (not an error): same job link already saved on another record.
export function findDuplicate(url, applications, currentId = null) {
  const key = normalizeUrl(url || "");
  if (!key) return null;
  return applications.find((a) => a.id !== currentId && normalizeUrl(a.jobUrl || "") === key) || null;
}

export function validateLogin(v) {
  const e = {};
  if (!v.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (!v.password) e.password = "Password is required.";
  return e;
}

export function validateRegister(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Name is required.";
  if (!v.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (!v.password) e.password = "Password is required.";
  else if (v.password.length < 8) e.password = "Use at least 8 characters.";
  if (v.confirm !== v.password) e.confirm = "Passwords do not match.";
  return e;
}
