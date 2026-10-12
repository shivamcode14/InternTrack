import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../components/Field.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { validateRegister } from "../utils/validation.js";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRequestError("");
    const found = validateRegister(values);
    if (Object.keys(found).length) return setErrors(found);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      navigate("/dashboard");
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setRequestError(error.message);
    }
  };

  return (
    <div className="auth-card">
      <h1>Create your account</h1>
      {requestError && <p className="error" role="alert">{requestError}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Name" name="name" autoComplete="name" value={values.name} onChange={handleChange} error={errors.name} required />
        <Field label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} error={errors.email} required />
        <Field label="Password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange} error={errors.password} hint="At least 8 characters" required />
        <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={values.confirm} onChange={handleChange} error={errors.confirm} required />
        <button type="submit" className="btn btn-primary btn-block">Register</button>
      </form>
      <p>Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
