// Label + input/select/textarea + error message, with accessibility attributes.
export default function Field({
  label, name, value, onChange, error, hint,
  type = "text", as = "input", required = false, children, ...rest
}) {
  const Tag = as;
  const props = {
    id: name,
    name,
    value,
    onChange,
    "aria-invalid": error ? "true" : "false",
    "aria-describedby": error ? `${name}-err` : undefined,
    ...rest,
  };
  if (as === "input") props.type = type;

  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      <Tag {...props}>{children}</Tag>
      {hint && !error && <small className="muted">{hint}</small>}
      {error && <small id={`${name}-err`} className="error" role="alert">{error}</small>}
    </div>
  );
}
