import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useMemo, useState } from 'react';
import TimeSlotsPicker from './TimeSlotsPicker.jsx';

// Helpers consistentes con el resto de la app
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

function sameSala(a, b) {
  const aId = a?.salaId || '';
  const bId = b?.salaId || '';

  if (aId && bId) return String(aId) === String(bId);

  const aNom = String(a?.salaNombre || '').trim().toLowerCase();
  const bNom = String(b?.salaNombre || '').trim().toLowerCase();

  return aNom && bNom && aNom === bNom;
}

/**
 * Props esperados:
 * - reserva (obj)
 * - reservas (array)  -> fuente de verdad desde ReservasPage
 * - onDelete(id)
 * - onUpdate(id, changes)
 */
function ReservaCard({ reserva, reservas = [], onDelete, onUpdate }) {
  const { user } = useAuth();

  // Guardia anti-crash por datos incompletos
  if (!reserva) return null;

  const isOwner = user && user.id === reserva.usuarioId;

  const [editing, setEditing] = useState(false);

  const [fecha, setFecha] = useState(reserva.fecha || '');
  const [hora, setHora] = useState(normalizeToStep(reserva.hora || '', 15) || '');
  const [notas, setNotas] = useState(reserva.notas || '');

  const [errors, setErrors] = useState({});

  // ✅ SINCRONIZACIÓN CLAVE: cuando cambia la reserva desde el estado global
  useEffect(() => {
    setFecha(reserva.fecha || '');
    setHora(normalizeToStep(reserva.hora || '', 15) || '');
    setNotas(reserva.notas || '');
    setErrors({});
  }, [reserva.id, reserva.fecha, reserva.hora, reserva.notas]);

  // Slots ocupados para la MISMA SALA y la fecha elegida
  // excluye esta misma reserva
  const occupiedTimes = useMemo(() => {
    const set = new Set();
    if (!fecha) return set;

    for (const r of reservas) {
      if (!r?.fecha || !r?.hora) continue;
      if (r.id === reserva.id) continue;
      if (r.fecha !== fecha) continue;
      if (!sameSala(r, reserva)) continue;

      const normalized = normalizeToStep(r.hora, 15);
      if (normalized) set.add(normalized);
    }

    return set;
  }, [reservas, fecha, reserva.id, reserva.salaId, reserva.salaNombre]);

  const minFecha = todayISO();

  const validate = () => {
    const newErrors = {};

    if (!fecha) newErrors.fecha = 'La fecha es obligatoria';
    else if (isPastDate(fecha)) newErrors.fecha = 'No podés elegir una fecha pasada';

    if (!hora) newErrors.hora = 'La hora es obligatoria';
    else if (timeIsPastForToday(fecha, hora)) {
      newErrors.hora = 'La hora no puede ser anterior a la hora actual';
    }

    if (hora && occupiedTimes.has(hora)) {
      newErrors.hora = 'Ese horario ya está ocupado para esta sala';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setFecha(reserva.fecha || '');
    setHora(normalizeToStep(reserva.hora || '', 15) || '');
    setNotas(reserva.notas || '');
    setErrors({});
    setEditing(false);
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!onUpdate) return;

    // ✅ Blindaje: mandar hora normalizada
    const safeHora = normalizeToStep(hora, 15) || hora;

    // Mantener sala original para no complejizar el flujo de edición
    const payload = reserva.salaId
      ? { fecha, hora: safeHora, notas, salaId: reserva.salaId }
      : { fecha, hora: safeHora, notas, salaNombre: reserva.salaNombre };

    await onUpdate(reserva.id, payload);
    setEditing(false);
  };

  const horaLabel = normalizeToStep(reserva.hora || '', 15) || reserva.hora || '--';

  return (
    <div className="card reserva-card">
      {/* =====================
          MODO VISTA
      ===================== */}
      {!editing ? (
        <>
          <div className="reserva-header">
            <h3 className="reserva-sala">
              <Link to={`/reservas/${reserva.id}`} className="link">
                {reserva.salaNombre || 'Sala'}
              </Link>
            </h3>
            <span className="reserva-fecha">
              {reserva.fecha || '--'} · {horaLabel}
            </span>
          </div>

          <div className="reserva-body">
            <p className="reserva-usuario">
              Reservado por: {reserva.nombreUsuario || 'Usuario'}
            </p>

            {reserva.notas && (
              <p className="reserva-notas">
                <span className="reserva-label">Notas:</span> {reserva.notas}
              </p>
            )}
          </div>

          <div className="reserva-footer">
            <span className="reserva-meta">
              Creada:{' '}
              {reserva.createdAt
                ? new Date(reserva.createdAt).toLocaleString()
                : '--'}
            </span>

            {isOwner && (
              <div className="reserva-actions">
                <button
                  className="btn btn-ghost btn-small"
                  onClick={() => setEditing(true)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => onDelete && onDelete(reserva.id)}
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* =====================
            MODO EDICIÓN
        ===================== */
        <>
          <div className="reserva-header">
            <h3 className="reserva-sala">
              Editar · {reserva.salaNombre || 'Sala'}
            </h3>
            <span className="reserva-fecha">
              {reserva.fecha || '--'} · {horaLabel}
            </span>
          </div>

          <div className="reserva-body">
            <div className="reserva-edit-grid">
              {/* FECHA */}
              <div className="form-field">
                <label className="form-label">
                  Fecha <span className="form-required">*</span>
                </label>
                <input
                  className="form-input"
                  type="date"
                  value={fecha}
                  min={minFecha}
                  onChange={(e) => {
                    setFecha(e.target.value);
                    setHora('');
                  }}
                />
                {errors.fecha && (
                  <span className="form-error">{errors.fecha}</span>
                )}
              </div>

              {/* HORA */}
              <div className="form-section">
                <TimeSlotsPicker
                  selectedDate={fecha}
                  occupiedTimes={occupiedTimes}
                  value={hora}
                  onChange={(t) => setHora(t)}
                />
                {errors.hora && (
                  <span className="form-error">{errors.hora}</span>
                )}
              </div>

              {/* NOTAS */}
              <div className="form-field">
                <label className="form-label">Notas</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Notas opcionales"
                />
              </div>
            </div>
          </div>

          <div className="reserva-footer">
            <span className="reserva-meta">
              Estás editando esta reserva
            </span>

            <div className="reserva-actions">
              <button
                className="btn btn-ghost btn-small"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary btn-small"
                onClick={handleSave}
              >
                Guardar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReservaCard;
