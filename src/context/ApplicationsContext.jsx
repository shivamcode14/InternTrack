import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { apiRequest } from "../services/api.js";

const ApplicationsContext = createContext(null);

export function ApplicationsProvider({ children }) {
  const { user } = useAuth();
  const [applicationState, setApplicationState] = useState({ ownerId: null, items: [] });
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const applications = applicationState.ownerId === user?.id ? applicationState.items : [];

  useEffect(() => {
    let active = true;
    setApplicationState({ ownerId: user?.id ?? null, items: [] });
    setError("");
    if (!user) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    const loadApplications = async () => {
      const firstPage = await apiRequest("/applications?page=0&size=100");
      const items = [...firstPage.content];
      for (let page = 1; page < firstPage.totalPages; page += 1) {
        const nextPage = await apiRequest(`/applications?page=${page}&size=100`);
        items.push(...nextPage.content);
      }
      return items;
    };

    loadApplications()
      .then((items) => {
        if (active) setApplicationState({ ownerId: user.id, items });
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [user?.id, reloadKey]);

  const refreshApplications = () => setReloadKey((key) => key + 1);

  const addApplication = async (data) => {
    const created = await apiRequest("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setApplicationState((previous) => ({
      ownerId: user.id,
      items: [created, ...(previous.ownerId === user.id ? previous.items : [])],
    }));
    setError("");
    return created;
  };

  const updateApplication = async (id, data) => {
    const updated = await apiRequest(`/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    setApplicationState((previous) => ({
      ownerId: user.id,
      items: previous.ownerId === user.id
        ? previous.items.map((application) => application.id === id ? updated : application)
        : [updated],
    }));
    setError("");
    return updated;
  };

  const deleteApplication = async (id) => {
    await apiRequest(`/applications/${id}`, { method: "DELETE" });
    setApplicationState((previous) => ({
      ownerId: user.id,
      items: previous.ownerId === user.id
        ? previous.items.filter((application) => application.id !== id)
        : [],
    }));
    setError("");
  };

  const getApplication = (id) => applications.find((a) => a.id === Number(id));

  return (
    <ApplicationsContext.Provider
      value={{
        applications,
        loading,
        error,
        refreshApplications,
        addApplication,
        updateApplication,
        deleteApplication,
        getApplication,
      }}
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
