const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function api(path, { method = "GET", body, token } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not connect to the server. Check that the API is running and try again.");
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw Object.assign(new Error(data?.message || "Request failed"), {
      status: response.status,
      data,
    });
  }
  return data;
}
