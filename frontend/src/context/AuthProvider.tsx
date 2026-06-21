import { useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, User } from '../types';
import { AuthContext } from './auth';
import api from '../api/axios';

const readStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) as User : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await api.get('/pengguna/me');
      const updatedUser = {
        id: response.data.id_pengguna,
        nama: response.data.nama,
        email: response.data.email,
        role: response.data.role,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch {
      // Jika error, logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user && localStorage.getItem('token')),
    signIn: (data: AuthResponse) => {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    },
    signOut: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    },
    refreshAuth,
  }), [user, refreshAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
