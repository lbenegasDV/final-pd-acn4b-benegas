import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import InputField from '../components/InputField.jsx';
import MessageBanner from '../components/MessageBanner.jsx';

function RegisterPage() {
  const { register, authError } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localMessage, setLocalMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage(null);
    setLoading(true);

    const result = await register(nombre, email, password);
    setLoading(false);

    if (result.ok) {
      setLocalMessage('Usuario registrado correctamente. Podés iniciar sesión.');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };

  return (
    <div className="page-center">
      <form className="card form form-narrow" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>

        <MessageBanner type="error" message={authError} />
        <MessageBanner
          type="success"
          message={localMessage}
          onClose={() => setLocalMessage(null)}
        />

        <InputField
          label="Nombre"
          name="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          required
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
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        <p className="form-footer-text">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="link">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
