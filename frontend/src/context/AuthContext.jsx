import { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, registerRequest } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Cargar desde localStorage si existe
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parseando usuario', e);
      }
    }

    setAuthLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    setAuthError(null);
    try {
      const data = await loginRequest(email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { ok: true };
    } catch (error) {
      setAuthError(error.message || 'Error al iniciar sesión');
      return { ok: false, message: error.message };
    }
  };

  const handleRegister = async (nombre, email, password) => {
    setAuthError(null);
    try {
      await registerRequest(nombre, email, password);
      // No logueamos automáticamente, dejamos que vaya al login
      return { ok: true };
    } catch (error) {
      setAuthError(error.message || 'Error al registrarse');
      return { ok: false, message: error.message };
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    authLoading,
    authError,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
