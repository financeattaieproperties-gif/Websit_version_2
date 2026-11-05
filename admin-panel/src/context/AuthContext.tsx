import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../api';

interface AuthState {
  loggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(() =>
    sessionStorage.getItem('admin_logged_in') === 'true'
  );

  const login = async (username: string, password: string) => {
    await api.login(username, password);
    sessionStorage.setItem('admin_logged_in', 'true');
    setLoggedIn(true);
  };

  const logout = async () => {
    await api.logout();
    sessionStorage.removeItem('admin_logged_in');
    setLoggedIn(false);
  };

  return <AuthContext.Provider value={{ loggedIn, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
