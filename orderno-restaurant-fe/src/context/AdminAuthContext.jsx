import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check for existing token in localStorage upon initialization
  useEffect(() => {
    let isMounted = true;
    async function verifyExistingSession() {
      const storedToken = localStorage.getItem('access_token');
      if (!storedToken) {
        if (isMounted) setLoadingAuth(false);
        return;
      }

      try {
        const user = await authAPI.getMe();
        if (isMounted && user) {
          setAdminUser(user);
          setToken(storedToken);
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        localStorage.removeItem('access_token');
        if (isMounted) {
          setAdminUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setLoadingAuth(false);
      }
    }

    verifyExistingSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    setAuthError(null);
    try {
      const res = await authAPI.login({ username, password });
      const { token: receivedToken, user } = res;

      localStorage.setItem('access_token', receivedToken);
      setToken(receivedToken);
      setAdminUser(user);
      return { success: true, user };
    } catch (err) {
      const message = err.message || 'Authentication failed';
      setAuthError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setAdminUser(null);
    setToken(null);
    setAuthError(null);
    try {
      authAPI.logout().catch(() => {});
    } catch {
      // Ignore
    }
  }, []);

  const value = {
    adminUser,
    token,
    isAuthenticated: !!adminUser,
    loadingAuth,
    authError,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

export default AdminAuthContext;
