import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('geovibe_token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('geovibe_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser({ username: 'DemoUser' });
    } else {
      localStorage.removeItem('geovibe_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
