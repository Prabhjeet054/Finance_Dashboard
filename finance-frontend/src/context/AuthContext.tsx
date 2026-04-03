import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { AuthData, User } from '../types';

type AuthContextValue = {
  token: string;
  user: User | null;
  isAuthenticated: boolean;
  login: (data: AuthData) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string>(() => localStorage.getItem('finance-token') || '');
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('finance-user');
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    isAuthenticated: Boolean(token && user),
    login: (data: AuthData) => {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('finance-token', data.token);
      localStorage.setItem('finance-user', JSON.stringify(data.user));
    },
    logout: () => {
      setToken('');
      setUser(null);
      localStorage.removeItem('finance-token');
      localStorage.removeItem('finance-user');
    },
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
