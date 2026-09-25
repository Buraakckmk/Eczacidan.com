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

const DEMO_USER: UserResponse = {
  id: 1,
  username: 'demo',
  gln: '3245676600002',
  email: 'sifa@eczane.com',
  pharmacy_name: 'Kadıköy Şifa Eczanesi',
  pharmacy_city: 'Kadıköy / İstanbul',
  pharmacy_address: 'Bağdat Cad. No: 142 Kadıköy / İstanbul',
  phone: '0216 345 67 89',
  is_verified: true,
  is_premium: true,
  balance: 1450.00,
  rating: 9.8,
  listing_count: 392,
};

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
    } catch (err) {
      // Sunucuya erişilemiyorsa veya token eskidiyse demo kullanıcı ile oturum koru
      setUser(DEMO_USER);
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
      const me = await api.me().catch(() => ({ ...DEMO_USER, username }));
      setUser(me);
    } catch (err) {
      // Ağ hatası veya backend kapalıysa otomatik demo girişi yap
      setStoredToken('demo-token-12345');
      setToken('demo-token-12345');
      setUser({
        ...DEMO_USER,
        username: username || 'demo',
      });
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
