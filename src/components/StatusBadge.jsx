import { getStatus } from "../constants/statuses.js";

export default function StatusBadge({ status }) {
  const s = getStatus(status);
  return (
    <span className="badge" style={{ color: s.color, borderColor: s.color }}>
      {s.label}
    </span>
  );
}
