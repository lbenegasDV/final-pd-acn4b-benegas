import { useEffect, useMemo, useState } from 'react';

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayISO() {
  return toISODate(new Date());
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getMonthGrid(date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const startDay = start.getDay(); // 0..6
  const daysInMonth = end.getDate();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(date.getFullYear(), date.getMonth(), d));
  }
  while (cells.length < 42) cells.push(null);

  return cells;
}

/**
 * CalendarAvailability
 * Props:
 * - occupiedDates: Set<string ISO> (opcional)
 * - selectedDate: string ISO (opcional)
 * - onSelectDate: (isoOrEmpty: string) => void
 *
 * Comportamiento agregado:
 * - Si hacés click sobre el mismo día seleccionado, lo deselecciona
 *   llamando onSelectDate('').
 */
function CalendarAvailability({
  occupiedDates = new Set(),
  selectedDate = '',
  onSelectDate
}) {
  const [cursor, setCursor] = useState(() => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // ✅ Sincroniza el mes mostrado cuando cambia la fecha seleccionada
  useEffect(() => {
    if (!selectedDate) return;

    const d = new Date(selectedDate);
    if (Number.isNaN(d.getTime())) return;

    const next = new Date(d.getFullYear(), d.getMonth(), 1);

    setCursor((prev) => {
      const same =
        prev.getFullYear() === next.getFullYear() &&
        prev.getMonth() === next.getMonth();
      return same ? prev : next;
    });
  }, [selectedDate]);

  const cells = useMemo(() => getMonthGrid(cursor), [cursor]);

  const label = cursor.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric'
  });

  const handlePrev = () =>
    setCursor((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const handleNext = () =>
    setCursor((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));

  const today = todayISO();

  const handleSelect = (iso) => {
    if (!onSelectDate) return;

    // ✅ toggle selección: click en el mismo día => deselecciona
    if (iso === selectedDate) {
      onSelectDate('');
    } else {
      onSelectDate(iso);
    }
  };

  return (
    <div className="card calendar">
      <div className="calendar-header">
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={handlePrev}
          aria-label="Mes anterior"
          title="Mes anterior"
        >
          ‹
        </button>

        <div className="calendar-title">{label}</div>

        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={handleNext}
          aria-label="Mes siguiente"
          title="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((d, idx) => {
          if (!d) {
            return <span key={idx} className="calendar-cell calendar-empty" />;
          }

          const iso = toISODate(d);

          const isPast = iso < today;
          const isOccupied = occupiedDates.has(iso);
          const isSelected = selectedDate === iso;
          const isToday = iso === today;

          const className = [
            'calendar-cell',
            isPast ? 'calendar-past' : '',
            isOccupied ? 'calendar-occupied' : 'calendar-available',
            isSelected ? 'calendar-selected' : '',
            isToday ? 'calendar-today' : ''
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={idx}
              type="button"
              className={className}
              disabled={isPast}
              onClick={() => handleSelect(iso)}
              title={
                isPast
                  ? 'Fecha pasada'
                  : isSelected
                  ? 'Fecha seleccionada'
                  : isOccupied
                  ? 'Hay reservas este día'
                  : 'Disponible'
              }
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span className="legend-dot legend-available" />
        <span className="legend-text">Disponible</span>
        <span className="legend-dot legend-occupied" />
        <span className="legend-text">Con reservas</span>
      </div>
    </div>
  );
}

export default CalendarAvailability;
