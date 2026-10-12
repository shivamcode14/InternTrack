import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Field from "../components/Field.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { validateLogin } from "../utils/validation.js";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRequestError("");
    const found = validateLogin(values);
    if (Object.keys(found).length) return setErrors(found);
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate("/dashboard");
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setRequestError(error.message);
    }
  };

  return (
    <div className="auth-card">
      <h1>Log in</h1>
      <p className="muted">Log in to manage your applications.</p>
      {requestError && <p className="error" role="alert">{requestError}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} error={errors.email} required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" value={values.password} onChange={handleChange} error={errors.password} required />
        <button type="submit" className="btn btn-primary btn-block">Log in</button>
      </form>
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
