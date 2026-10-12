import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, readSession, saveSession } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const user = session?.user || null;

  useEffect(() => {
    const handleUnauthorized = () => {
      saveSession(null);
      setSession(null);
    };
    window.addEventListener("interntrack:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("interntrack:unauthorized", handleUnauthorized);
  }, []);

  const authenticate = async (path, credentials) => {
    const result = await apiRequest(path, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    const nextSession = { token: result.token, user: result.user };
    saveSession(nextSession);
    setSession(nextSession);
    return result.user;
  };

  const login = (credentials) => authenticate("/auth/login", credentials);
  const register = (credentials) => authenticate("/auth/register", credentials);
  const logout = () => {
    saveSession(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
