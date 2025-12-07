import Navbar from './Navbar.jsx';

function Layout({ children }) {
  return (
    <div className="app-root">
      <Navbar />
      <main className="app-main">
        <div className="app-container">{children}</div>
      </main>
      <footer className="app-footer">
        <span>Gestor de Reservas de Coworking · Plataformas de Desarrollo · Benegas · Final</span>
      </footer>
    </div>
  );
}

export default Layout;
