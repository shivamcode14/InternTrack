import { createContext, useContext, useState } from "react";
import { sampleApplications } from "../data/sampleApplications.js";

// Week 1: data lives in React state only (resets on refresh).
// Week 3: replace these functions with real API calls.
const ApplicationsContext = createContext(null);

export function ApplicationsProvider({ children }) {
  const [applications, setApplications] = useState(sampleApplications);

  const addApplication = (data) => {
    const nextId = applications.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    setApplications((prev) => [{ ...data, id: nextId }, ...prev]);
  };

  const updateApplication = (id, data) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...data, id } : a)));
  };

  const deleteApplication = (id) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const getApplication = (id) => applications.find((a) => a.id === Number(id));

  return (
    <ApplicationsContext.Provider
      value={{ applications, addApplication, updateApplication, deleteApplication, getApplication }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error("useApplications must be used inside ApplicationsProvider");
  return ctx;
}
