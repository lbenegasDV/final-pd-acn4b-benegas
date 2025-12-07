import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">CW</span>
          <span className="logo-text">Coworking Reservas</span>
        </Link>

        <nav className="nav-links">
          {user && (
            <NavLink
              to="/reservas"
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              Mis reservas
            </NavLink>
          )}
        </nav>

        <div className="nav-right">
          {user ? (
            <>
              <span className="nav-user">
                {user.nombre} <span className="nav-user-email">({user.email})</span>
              </span>
              <button className="btn btn-secondary btn-small" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-small">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn btn-primary btn-small">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
