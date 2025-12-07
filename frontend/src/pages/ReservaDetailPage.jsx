import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getReservaByIdRequest,
  deleteReservaRequest
} from '../services/api.js';
import MessageBanner from '../components/MessageBanner.jsx';

function ReservaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  const isOwner = reserva && user && reserva.usuarioId === user.id;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getReservaByIdRequest(id);
        setReserva(data);
      } catch (error) {
        setMessageType('error');
        setMessage(error.message || 'Error al cargar el detalle');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!isOwner) return;

    const ok = window.confirm('¿Seguro que querés eliminar esta reserva?');
    if (!ok) return;

    try {
      await deleteReservaRequest(token, id);
      setMessageType('success');
      setMessage('Reserva eliminada correctamente');
      setTimeout(() => navigate('/reservas'), 600);
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Error al eliminar la reserva');
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="page-center">
        <div className="card">
          <h2>No se encontró la reserva</h2>
          <Link to="/reservas" className="btn btn-primary">
            Volver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Detalle de reserva</h1>
          <p className="page-subtitle">
            Información completa de la reserva seleccionada.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/reservas" className="btn btn-secondary btn-small">
            Volver a listado
          </Link>
          {isOwner && (
            <button className="btn btn-danger btn-small" onClick={handleDelete}>
              Eliminar
            </button>
          )}
        </div>
      </div>

      <MessageBanner
        type={messageType}
        message={message}
        onClose={() => setMessage(null)}
      />

      <div className="card">
        <h2 style={{ marginBottom: '0.2rem' }}>
          {reserva.salaNombre}
        </h2>
        <p className="page-subtitle" style={{ marginBottom: '1rem' }}>
          {reserva.fecha} · {reserva.hora}
        </p>

        <div style={{ display: 'grid', gap: '0.65rem' }}>
          <div>
            <span className="reserva-label">Reservado por</span>
            <div>{reserva.nombreUsuario}</div>
          </div>

          <div>
            <span className="reserva-label">Email</span>
            <div>{reserva.emailUsuario}</div>
          </div>

          <div>
            <span className="reserva-label">Notas</span>
            <div>{reserva.notas || 'Sin notas'}</div>
          </div>

          <div>
            <span className="reserva-label">Creada</span>
            <div>{new Date(reserva.createdAt).toLocaleString()}</div>
          </div>

          {reserva.updatedAt && (
            <div>
              <span className="reserva-label">Actualizada</span>
              <div>{new Date(reserva.updatedAt).toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReservaDetailPage;
