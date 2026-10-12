import { api } from "../api/client.js";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const SESSION_KEY = "interntrack_session";

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function readSession() {
  try {
    const value = sessionStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_KEY);
}

export async function apiRequest(path, options = {}) {
  const session = readSession();
  let body;
  try {
    body = options.body === undefined ? undefined : JSON.parse(options.body);
  } catch (error) {
    throw new ApiError(`Invalid JSON request body: ${error.message}`);
  }

  try {
    return await api(`${API_URL}/api${path}`, {
      method: options.method || "GET",
      body,
      token: session?.token,
    });
  } catch (error) {
    if (error.status === 401 && path !== "/auth/login" && path !== "/auth/register") {
      window.dispatchEvent(new Event("interntrack:unauthorized"));
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message, error.status, error.data?.fieldErrors || {});
  }
}
