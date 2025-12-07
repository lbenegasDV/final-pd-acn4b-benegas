function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function currentTimeHHMM() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function TimeField({ label, name, value, onChange, selectedDate, error }) {
  const isToday = selectedDate && selectedDate === todayISO();
  const min = isToday ? currentTimeHHMM() : undefined;

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label} <span className="form-required">*</span>
      </label>
      <input
        id={name}
        name={name}
        type="time"
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

export default TimeField;
