import { useEffect, useMemo, useState } from 'react';
import CalendarAvailability from './CalendarAvailability.jsx';
import TimeSlotsPicker from './TimeSlotsPicker.jsx';
import { getSalasRequest } from '../services/api.js';

// Helpers
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayISO() {
  return toISODate(new Date());
}

function isPastDate(dateISO) {
  if (!dateISO) return false;
  return dateISO < todayISO();
}

function timeIsPastForToday(dateISO, timeHHMM) {
  if (!dateISO || !timeHHMM) return false;
  if (dateISO !== todayISO()) return false;

  const now = new Date();
  const [hh, mm] = timeHHMM.split(':').map(Number);
  const candidate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hh,
    mm,
    0,
    0
  );

  return candidate.getTime() < now.getTime();
}

// Normaliza una hora real al grid de 15 min
function normalizeToStep(timeHHMM, step = 15) {
  if (!timeHHMM) return null;
  const [h, m] = timeHHMM.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  const total = h * 60 + m;
  const rounded = Math.round(total / step) * step;

  const hh = String(Math.floor(rounded / 60)).padStart(2, '0');
  const mm = String(rounded % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function ReservaForm({ onCreate, reservas = [] }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [notas, setNotas] = useState('');

  // ✅ Colapso/expansión de horarios
  const [showSlots, setShowSlots] = useState(false);

  // Salas
  const [salas, setSalas] = useState([]);
  const [salasLoading, setSalasLoading] = useState(true);
  const [salasError, setSalasError] = useState(null);

  const [salaMode, setSalaMode] = useState('lista');
  const [selectedSalaId, setSelectedSalaId] = useState('');
  const [manualSalaNombre, setManualSalaNombre] = useState('');

  const [errors, setErrors] = useState({});

  // ✅ Si se limpia fecha por cualquier motivo, colapsa horarios
  useEffect(() => {
    if (!fecha) setShowSlots(false);
  }, [fecha]);

  // Carga de salas
  useEffect(() => {
    const loadSalas = async () => {
      try {
        const data = await getSalasRequest();
        setSalas(data);

        if (data.length > 0) {
          setSelectedSalaId(data[0].id);
          setSalaMode('lista');
        } else {
          setSalaMode('manual');
        }
      } catch {
        setSalasError(
          'No se pudieron cargar las salas. Podés ingresar la sala manualmente.'
        );
        setSalaMode('manual');
      } finally {
        setSalasLoading(false);
      }
    };

    loadSalas();
  }, []);

  // Nombre de la sala seleccionada (compatibilidad con reservas viejas)
  const selectedSalaNombre = useMemo(() => {
    if (!selectedSalaId) return '';
    return (salas.find((s) => s.id === selectedSalaId)?.nombre || '').trim();
  }, [salas, selectedSalaId]);

  // occupiedTimes NORMALIZADO a 15 min
  const occupiedTimes = useMemo(() => {
    const set = new Set();
    if (!fecha) return set;

    for (const r of reservas) {
      if (!r?.fecha || !r?.hora) continue;
      if (r.fecha !== fecha) continue;

      const normalized = normalizeToStep(r.hora, 15);
      if (!normalized) continue;

      const rSalaId = r.salaId || '';
      const rSalaNombre = (r.salaNombre || '').trim().toLowerCase();

      if (salaMode === 'lista' && selectedSalaId) {
        if (rSalaId === selectedSalaId) {
          set.add(normalized);
          continue;
        }

        if (
          !rSalaId &&
          selectedSalaNombre &&
          rSalaNombre === selectedSalaNombre.toLowerCase()
        ) {
          set.add(normalized);
        }
      } else if (salaMode === 'manual' && manualSalaNombre.trim()) {
        if (rSalaNombre === manualSalaNombre.trim().toLowerCase()) {
          set.add(normalized);
        }
      }
    }

    return set;
  }, [
    reservas,
    fecha,
    salaMode,
    selectedSalaId,
    manualSalaNombre,
    selectedSalaNombre
  ]);

  // occupiedDates con fallback por nombre si salaId viene null
  const occupiedDates = useMemo(() => {
    const set = new Set();

    for (const r of reservas) {
      if (!r?.fecha) continue;

      const rSalaId = r.salaId || '';
      const rSalaNombre = (r.salaNombre || '').trim().toLowerCase();

      if (salaMode === 'lista' && selectedSalaId) {
        if (rSalaId === selectedSalaId) {
          set.add(r.fecha);
          continue;
        }

        if (
          !rSalaId &&
          selectedSalaNombre &&
          rSalaNombre === selectedSalaNombre.toLowerCase()
        ) {
          set.add(r.fecha);
        }
      } else if (salaMode === 'manual' && manualSalaNombre.trim()) {
        if (rSalaNombre === manualSalaNombre.trim().toLowerCase()) {
          set.add(r.fecha);
        }
      } else {
        set.add(r.fecha);
      }
    }

    return set;
  }, [
    reservas,
    salaMode,
    selectedSalaId,
    manualSalaNombre,
    selectedSalaNombre
  ]);

  const validate = () => {
    const newErrors = {};

    // Fecha
    if (!fecha) newErrors.fecha = 'La fecha es obligatoria';
    else if (isPastDate(fecha)) newErrors.fecha = 'No podés elegir una fecha pasada';

    // Hora
    if (!hora) newErrors.hora = 'La hora es obligatoria';
    else if (timeIsPastForToday(fecha, hora)) {
      newErrors.hora = 'La hora no puede ser anterior a la hora actual';
    }

    // Sala
    if (salaMode === 'lista') {
      if (!selectedSalaId) newErrors.sala = 'Seleccioná una sala';
    } else {
      if (!manualSalaNombre.trim()) newErrors.sala = 'Ingresá una sala';
    }

    // Colisión contra slots normalizados
    if (hora && occupiedTimes.has(hora)) {
      newErrors.hora = 'Ese horario ya está ocupado para la sala seleccionada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalaModeChange = (e) => {
    const value = e.target.value;
    setSalaMode(value);
    setErrors((prev) => ({ ...prev, sala: undefined }));
    setHora('');
    setShowSlots(false); // ✅ cambia contexto

    if (value === 'lista') {
      if (salas.length > 0) setSelectedSalaId(salas[0].id);
      setManualSalaNombre('');
    } else {
      setSelectedSalaId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload =
      salaMode === 'lista'
        ? { fecha, hora, salaId: selectedSalaId, notas }
        : { fecha, hora, salaNombre: manualSalaNombre.trim(), notas };

    await onCreate(payload);

    setFecha('');
    setHora('');
    setNotas('');
    setErrors({});
    setShowSlots(false); // ✅ colapsa post submit
    if (salaMode === 'manual') setManualSalaNombre('');
  };

  const minFecha = todayISO();

  return (
    <div className="form-calendar-wrapper">
      <form className="card form" onSubmit={handleSubmit}>
        <div className="form-header-row">
          <h2>Nueva reserva</h2>
        </div>

        {salasError && <span className="form-error">{salasError}</span>}

        {/* Bloque compacto: Fecha + Sala */}
        <div className="form-grid">
          {/* FECHA */}
          <div className="form-field">
            <label className="form-label">
              Fecha <span className="form-required">*</span>
            </label>
            <input
              className="form-input"
              type="date"
              name="fecha"
              value={fecha}
              min={minFecha}
              onChange={(e) => {
                const next = e.target.value;
                setFecha(next);
                setHora('');
                setShowSlots(Boolean(next)); // ✅ abre solo si hay fecha
              }}
              required
            />
            {errors.fecha && <span className="form-error">{errors.fecha}</span>}
          </div>

          {/* SALA */}
          <div className="form-field">
            <label className="form-label">
              Sala <span className="form-required">*</span>
            </label>

            <div className="form-field" style={{ marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  <input
                    type="radio"
                    name="salaMode"
                    value="lista"
                    checked={salaMode === 'lista'}
                    onChange={handleSalaModeChange}
                    disabled={salasLoading || salas.length === 0}
                    style={{ marginRight: '0.25rem' }}
                  />
                  Elegir de la lista
                </label>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  <input
                    type="radio"
                    name="salaMode"
                    value="manual"
                    checked={salaMode === 'manual'}
                    onChange={handleSalaModeChange}
                    style={{ marginRight: '0.25rem' }}
                  />
                  Ingresar manualmente
                </label>
              </div>
            </div>

            {salaMode === 'lista' && salas.length > 0 && (
              <select
                name="salaId"
                className="form-input"
                value={selectedSalaId}
                onChange={(e) => {
                  setSelectedSalaId(e.target.value);
                  setHora('');
                  setShowSlots(false); // ✅ cambia contexto
                }}
              >
                {salas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} · {s.capacidad} personas · {s.ubicacion}
                  </option>
                ))}
              </select>
            )}

            {salaMode === 'manual' && (
              <input
                type="text"
                name="salaNombre"
                className="form-input"
                placeholder="Ej: Sala Azul, Sala Reunión 1"
                value={manualSalaNombre}
                onChange={(e) => {
                  setManualSalaNombre(e.target.value);
                  setHora('');
                  setShowSlots(false); // ✅ cambia contexto
                }}
              />
            )}

            {errors.sala && <span className="form-error">{errors.sala}</span>}
          </div>
        </div>

        {/* Hora como sección colapsable */}
        <div className="form-section">
          <div className="form-header-row" style={{ marginBottom: '0.25rem' }}>
            <div className="form-section-title" style={{ margin: 0 }}>
              Disponibilidad horaria
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => setShowSlots((s) => !s)}
              disabled={!fecha}
              title={!fecha ? 'Elegí una fecha primero' : 'Mostrar/ocultar horarios'}
            >
              {showSlots ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {showSlots && (
            <>
              <TimeSlotsPicker
                selectedDate={fecha}
                occupiedTimes={occupiedTimes}
                value={hora}
                onChange={(t) => {
                  setHora(t);
                  setShowSlots(false); // ✅ auto-colapsa al elegir hora
                }}
              />
              {errors.hora && <span className="form-error">{errors.hora}</span>}
            </>
          )}
        </div>

        {/* NOTAS */}
        <div className="form-field">
          <label htmlFor="notas" className="form-label">
            Notas (opcional)
          </label>
          <textarea
            id="notas"
            name="notas"
            className="form-textarea"
            rows="3"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Breve descripción de la reunión"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Crear reserva
        </button>
      </form>

      <CalendarAvailability
        occupiedDates={occupiedDates}
        selectedDate={fecha}
        onSelectDate={(iso) => {
          setFecha(iso);
          setHora('');

          if (!iso) {
            setShowSlots(false); // ✅ deseleccionó el mismo día
          } else {
            setShowSlots(true); // ✅ seleccionó un día nuevo
          }
        }}
      />
    </div>
  );
}

export default ReservaForm;
