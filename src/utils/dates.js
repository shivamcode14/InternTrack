// Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" as LOCAL time (avoids timezone shifts).
export function parseLocal(s) {
  if (!s) return null;
  const [d, t] = s.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [hh = 0, mm = 0] = t ? t.split(":").map(Number) : [];
  return new Date(y, m - 1, day, hh, mm);
}

export function formatDate(s, withTime = false) {
  const d = parseLocal(s);
  if (!d) return "—";
  let out = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  if (withTime && s.includes("T")) {
    out += ", " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  return out;
}

export function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function daysUntil(date) {
  return Math.round((date - startOfToday()) / 86400000);
}
