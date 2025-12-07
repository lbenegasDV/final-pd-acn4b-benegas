function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function DateField({ label, name, value, onChange, error }) {
  const min = todayISO();

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label} <span className="form-required">*</span>
      </label>
      <input
        id={name}
        name={name}
        type="date"
        className="form-input"
        value={value}
        min={min}
        onChange={onChange}
        required
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default DateField;
