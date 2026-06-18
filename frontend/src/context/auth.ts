import { createContext, useContext } from 'react';
import type { AuthResponse, User } from '../types';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (data: AuthResponse) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return context;
};
