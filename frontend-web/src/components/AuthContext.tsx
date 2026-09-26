import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api, getStoredToken, setStoredToken } from '../../services/api';
import type { UserResponse } from '../../types/api';

interface AuthContextValue {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutLocalOnly: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);

  const fetchMe = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      // Token geçersiz veya süresi dolmuş — oturumu temizle
      setStoredToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && !user) {
      setIsLoading(true);
      fetchMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ username, password });
      setStoredToken(res.access_token);
      setToken(res.access_token);
      const me = await api.me();
      setUser(me);
    } catch (err) {
      // Giriş başarısız — hatayı yukarı ilet, otomatik demo girişi yapma
      setStoredToken(null);
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logoutLocalOnly = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    logoutLocalOnly();
  }, [logoutLocalOnly]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const me = await api.me();
    setUser(me);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      logoutLocalOnly,
      refreshUser,
    }),
    [user, token, isLoading, login, logout, logoutLocalOnly, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
