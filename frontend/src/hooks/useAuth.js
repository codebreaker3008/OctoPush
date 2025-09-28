import { useState, useCallback } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback((userData, token) => {
    setUser(userData);
    if (token) {
      localStorage.setItem('token', token);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  return {
    user,
    login,
    logout,
    loading,
    setLoading
  };
};