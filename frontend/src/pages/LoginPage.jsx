import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import InputField from '../components/InputField.jsx';
import MessageBanner from '../components/MessageBanner.jsx';

function LoginPage() {
  const { login, authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localMessage, setLocalMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.ok) {
      setLocalMessage('Inicio de sesión exitoso. Redirigiendo...');
      setTimeout(() => {
        navigate('/reservas');
      }, 700);
    }
  };

  return (
    <div className="page-center">
      <form className="card form form-narrow" onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>

        <MessageBanner
          type="error"
          message={authError}
          onClose={() => {}}
        />
        <MessageBanner
          type="success"
          message={localMessage}
          onClose={() => setLocalMessage(null)}
        />

        <InputField
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          required
        />

        <InputField
          label="Contraseña"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
        />

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="form-footer-text">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="link">
            Registrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
