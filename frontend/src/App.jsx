import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ReservasPage from './pages/ReservasPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ReservaDetailPage from './pages/ReservaDetailPage.jsx';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/reservas" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <ReservasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservas/:id"
          element={
            <ProtectedRoute>
              <ReservaDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
