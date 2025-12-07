import { useEffect, useMemo, useState } from 'react';

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

function buildSlots(stepMinutes = 15) {
  const slots = [];
  const startMinutes = 8 * 60;
  const endMinutes = 20 * 60;

  for (let t = startMinutes; t <= endMinutes; t += stepMinutes) {
    const hh = String(Math.floor(t / 60)).padStart(2, '0');
    const mm = String(t % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

function isBefore(a, b) {
  return a < b; // HH:MM funciona bien por comparación string
}

/**
 * Props:
 * - label
 * - selectedDate
 * - occupiedTimes (Set de HH:MM normalizados)
 * - value
 * - onChange(time)
 *
 * Opcionales:
 * - collapsible
 * - defaultOpen
 * - open (controlado)
 * - onOpenChange
 * - autoCloseOnSelect
 */
function TimeSlotsPicker({
  label = 'Hora',
  selectedDate = '',
  occupiedTimes = new Set(),
  value = '',
  onChange,

  collapsible = false,
  defaultOpen = true,
  open,
  onOpenChange,
  autoCloseOnSelect = false
}) {
  const slots = useMemo(() => buildSlots(15), []);
  const hasDate = Boolean(selectedDate);

  // open controlado o interno
  const isControlled = typeof open === 'boolean';
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const setOpenSafe = (next) => {
    if (isControlled) {
      onOpenChange && onOpenChange(next);
    } else {
      setInternalOpen(next);
      onOpenChange && onOpenChange(next);
    }
  };

  // Si cambia la fecha, abre panel si es colapsable
  useEffect(() => {
    if (!collapsible) return;

    if (!hasDate) {
      setOpenSafe(false);
      return;
    }

    setOpenSafe(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  if (!hasDate) {
    return (
      <div className="form-field">
        <label className="form-label">
          {label} <span className="form-required">*</span>
        </label>
        <div className="timeslots-placeholder">
          Elegí una fecha para ver horarios disponibles.
        </div>
      </div>
    );
  }

  const isToday = selectedDate === todayISO();
  const minTime = isToday ? currentTimeHHMM() : null;

  let pastCount = 0;
  let occupiedCount = 0;

  for (const t of slots) {
    const isPast = isToday && minTime && isBefore(t, minTime);
    if (isPast) pastCount++;

    if (occupiedTimes.has(t)) occupiedCount++;
  }

  const availableCount = Math.max(slots.length - occupiedCount - pastCount, 0);

  const shouldShow = !collapsible || isOpen;

  return (
    <div className="form-field">
      <div className="form-header-row">
        <label className="form-label">
          {label} <span className="form-required">*</span>
        </label>

        {collapsible && (
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => setOpenSafe(!isOpen)}
            title="Mostrar u ocultar horarios"
          >
            {isOpen ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>

      <div className="timeslots-meta">
        <span>{occupiedCount} ocupados</span>
        <span>·</span>
        <span>{availableCount} disponibles</span>
      </div>

      {shouldShow && (
        <div className="timeslots">
          {slots.map((time) => {
            const isOccupied = occupiedTimes.has(time);
            const isPast = isToday && minTime && isBefore(time, minTime);
            const isSelected = value === time;

            const disabled = isOccupied || isPast;

            const className = [
              'timeslot',
              isSelected ? 'timeslot-selected' : '',
              isOccupied ? 'timeslot-occupied' : '',
              isPast ? 'timeslot-past' : ''
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={time}
                type="button"
                className={className}
                disabled={disabled}
                aria-pressed={isSelected}
                title={
                  isOccupied
                    ? 'Horario ocupado'
                    : isPast
                    ? 'Horario pasado'
                    : 'Disponible'
                }
                onClick={() => {
                  onChange && onChange(time);
                  if (collapsible && autoCloseOnSelect) {
                    setOpenSafe(false);
                  }
                }}
              >
                {time}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TimeSlotsPicker;
