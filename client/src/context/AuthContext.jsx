import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('gharsetu_token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gharsetu_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('gharsetu_user');
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
    }
  }, [token]);

  const login = (data) => {
    const accessToken = data.accessToken || data.token;
    const userData = data.user || data;
    if (accessToken) {
      localStorage.setItem('gharsetu_token', accessToken);
      setToken(accessToken);
    }
    if (userData) {
      localStorage.setItem('gharsetu_user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('gharsetu_user', JSON.stringify(merged));
    setUser(merged);
  };

  const logout = () => {
    localStorage.removeItem('gharsetu_token');
    localStorage.removeItem('gharsetu_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        updateUser,
        logout,
        isAuthenticated: !!token && !!user,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

