import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('appeally_token');
    if (!token) { setLoading(false); return; }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.get('/api/auth/me')
      .then(r => setUser(r.data))
      .catch(() => {
        localStorage.removeItem('appeally_token');
        delete axios.defaults.headers.common['Authorization'];
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem('appeally_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('appeally_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
