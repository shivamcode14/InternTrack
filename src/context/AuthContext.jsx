import { createContext, useContext, useState } from "react";

// Week 1: FAKE auth (UI only). Week 2 replaces this with real login via the API.
const AuthContext = createContext(null);
const KEY = "interntrack_user";

function load() {
  try {
    const v = sessionStorage.getItem(KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
function save(user) {
  try {
    if (user) sessionStorage.setItem(KEY, JSON.stringify(user));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: app still works for this tab */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(load);
  const login = (u) => { setUser(u); save(u); };
  const logout = () => { setUser(null); save(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
