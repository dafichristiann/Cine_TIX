import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, User } from '../types';
import { AuthContext } from './auth';

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
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
