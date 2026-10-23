import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../api';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';

const TOKEN_KEY = 'ji.token';

interface AuthContextValue {
  token: string | null;
  username: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface JwtClaims {
  sub?: string;
  exp?: number;
}

function decodeClaims(token: string): JwtClaims | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)) as JwtClaims;
  } catch {
    return null;
  }
}

function isExpired(claims: JwtClaims | null) {
  return !!claims?.exp && claims.exp * 1000 <= Date.now();
}

function readStoredToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
    if (token && isExpired(decodeClaims(token))) {
      clearStoredToken();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = readStoredToken();
    // Set synchronously so the first requests from child components carry the token.
    setAuthToken(stored);
    return stored;
  });

  const logout = useCallback(() => {
    clearStoredToken();
    setAuthToken(null);
    setToken(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (username: string, password: string, remember: boolean) => {
    const newToken = await api.login(username, password);
    clearStoredToken();
    try {
      (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, newToken);
    } catch {
      // Storage unavailable; the session lasts until the tab closes.
    }
    setAuthToken(newToken);
    setToken(newToken);
  }, []);

  const register = useCallback((username: string, password: string) => api.register(username, password), []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    username: token ? decodeClaims(token)?.sub ?? null : null,
    login,
    register,
    logout,
  }), [token, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
