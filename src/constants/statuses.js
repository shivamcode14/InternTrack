// Single source of truth for application statuses.
// Keep these values identical to the backend ApplicationStatus enum.
export const STATUSES = [
  { value: "SAVED", label: "Saved", color: "#5b6873" },
  { value: "APPLIED", label: "Applied", color: "#246b9e" },
  { value: "ASSESSMENT", label: "Assessment", color: "#b86a16" },
  { value: "INTERVIEW", label: "Interview", color: "#1e8a8a" },
  { value: "OFFER", label: "Offer", color: "#2f7d5b" },
  { value: "REJECTED", label: "Rejected", color: "#a83d3d" },
];

export const SOURCES = ["LinkedIn", "Company Website", "Indeed", "Naukri", "Campus", "Referral", "Other"];

export const getStatus = (value) => STATUSES.find((s) => s.value === value) || STATUSES[0];
