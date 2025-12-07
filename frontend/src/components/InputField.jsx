function InputField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required,
  ...rest
}) {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label} {required && <span className="form-required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...rest}
      />
    </div>
  );
}

export default InputField;
