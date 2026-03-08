import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Ensure REACT_APP_BACKEND_URL points to your DigitalOcean backend, e.g.:
// REACT_APP_BACKEND_URL=https://schirochecker-gqszi.ondigitalocean.app
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('schiro_token'));
  const [loading, setLoading] = useState(true);

  // Validate token on app load
  const validateToken = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setUser(res.data);
    } catch {
      localStorage.removeItem('schiro_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { validateToken(); }, [validateToken]);

  // Login function using Master Key
  const login = async (key) => {
    if (!key) throw new Error('Master key is required');

    const normalizedKey = String(key)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();

    const res = await axios.post(
      `${API}/auth/login`,
      { key: normalizedKey },
      { timeout: 15000 },
    );

    localStorage.setItem('schiro_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);

    return res.data;
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${API}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // ignore errors on logout
    }
    localStorage.removeItem('schiro_token');
    setToken(null);
    setUser(null);
  };

  // Tiers
  const isMaster = user?.is_master === true;
  const isPremium = user?.tier === 'premium' && !isMaster;
  const isFree = user?.tier === 'free' && !isMaster;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isMaster, isPremium, isFree }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
