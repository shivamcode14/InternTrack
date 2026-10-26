
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Applications from "./pages/Applications.jsx";
import ApplicationForm from "./pages/ApplicationForm.jsx";
import ApplicationDetails from "./pages/ApplicationDetails.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public pages (no navbar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* App pages (with navbar) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/new" element={<ApplicationForm />} />
        <Route
          path="/applications/:id"
          element={<ApplicationDetails />}
        />
        <Route
          path="/applications/:id/edit"
          element={<ApplicationForm />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
