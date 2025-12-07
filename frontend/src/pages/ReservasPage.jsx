import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getReservasRequest,
  createReservaRequest,
  deleteReservaRequest,
  updateReservaRequest
} from '../services/api.js';
import ReservaForm from '../components/ReservaForm.jsx';
import ReservaCard from '../components/ReservaCard.jsx';
import MessageBanner from '../components/MessageBanner.jsx';

function ReservasPage() {
  const { token } = useAuth();

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  const showMessage = useCallback((type, text) => {
    setMessageType(type);
    setMessage(text);
  }, []);

  const loadReservas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReservasRequest();
      setReservas(Array.isArray(data) ? data : []);
    } catch (error) {
      showMessage('error', error?.message || 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadReservas();
  }, [loadReservas]);

  const handleCreate = async (reservaData) => {
    try {
      if (!token) {
        throw new Error('Sesión inválida. Volvé a iniciar sesión.');
      }

      const data = await createReservaRequest(token, reservaData);

      // Backend esperado: { message, reserva }
      if (data?.reserva) {
        setReservas((prev) => [data.reserva, ...prev]);
      } else {
        await loadReservas();
      }

      showMessage('success', 'Reserva creada correctamente');
    } catch (error) {
      const status = error?.status || error?.response?.status;

      if (status === 409) {
        showMessage('error', 'Ese horario ya está ocupado para la sala seleccionada.');
      } else {
        showMessage('error', error?.message || 'Error al crear la reserva');
      }

      // importante para que ReservaForm no continúe como si fuera éxito
      throw error;
    }
  };

  const handleUpdate = async (id, changes) => {
    try {
      if (!token) {
        throw new Error('Sesión inválida. Volvé a iniciar sesión.');
      }

      const data = await updateReservaRequest(token, id, changes);

      if (data?.reserva) {
        const updated = data.reserva;
        const updatedId = updated.id || id;

        setReservas((prev) =>
          prev.map((r) => (r.id === updatedId ? updated : r))
        );
      } else {
        await loadReservas();
      }

      showMessage('success', 'Reserva actualizada correctamente');
    } catch (error) {
      const status = error?.status || error?.response?.status;

      if (status === 409) {
        showMessage('error', 'Ese horario ya está ocupado para la sala seleccionada.');
      } else {
        showMessage('error', error?.message || 'Error al actualizar la reserva');
      }

      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar esta reserva?')) return;

    try {
      if (!token) {
        throw new Error('Sesión inválida. Volvé a iniciar sesión.');
      }

      await deleteReservaRequest(token, id);

      // ✅ fuente única de verdad
      setReservas((prev) => prev.filter((r) => r.id !== id));

      showMessage('success', 'Reserva eliminada correctamente');
    } catch (error) {
      showMessage('error', error?.message || 'Error al eliminar la reserva');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Mis reservas</h1>
          <p className="page-subtitle">
            Gestioná las reservas de salas de tu espacio de coworking.
          </p>
        </div>
      </div>

      <MessageBanner
        type={messageType}
        message={message}
        onClose={() => setMessage(null)}
      />

      <div className="page-grid">
        <div className="page-column">
          {/* ✅ clave: el form recibe reservas del padre
              para calendario + slots totalmente reactivos */}
          <ReservaForm onCreate={handleCreate} reservas={reservas} />
        </div>

        <div className="page-column">
          {loading ? (
            <div className="page-center">
              <div className="spinner" />
            </div>
          ) : reservas.length === 0 ? (
            <div className="card empty-state">
              <p>No hay reservas registradas todavía.</p>
              <p>Usá el formulario de la izquierda para crear la primera.</p>
            </div>
          ) : (
            <div className="reserva-list">
              {reservas.map((reserva) => (
                <ReservaCard
                  key={reserva.id}
                  reserva={reserva}
                  reservas={reservas}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReservasPage;
