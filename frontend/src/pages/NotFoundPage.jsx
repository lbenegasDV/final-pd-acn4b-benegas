import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="page-center">
      <div className="card">
        <h1>404</h1>
        <p>Página no encontrada.</p>
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
