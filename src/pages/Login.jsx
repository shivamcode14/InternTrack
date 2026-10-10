import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Field from "../components/Field.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { validateLogin } from "../utils/validation.js";

// Week 1: FAKE login. Any valid-looking email + password works.
export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateLogin(values);
    if (Object.keys(found).length) return setErrors(found);
    login({ name: values.email.split("@")[0], email: values.email.trim() });
    navigate("/dashboard");
  };

  return (
    <div className="auth-card">
      <h1>Log in</h1>
      <p className="muted">Week 1 prototype: login is simulated. Real authentication comes in Week 2.</p>
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} error={errors.email} required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" value={values.password} onChange={handleChange} error={errors.password} required />
        <button type="submit" className="btn btn-primary btn-block">Log in</button>
      </form>
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
