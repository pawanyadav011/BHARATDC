import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService, AuthSession } from '../services/authService';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password?: string, facility?: string) => Promise<User>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => authService.getCurrentSession());
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [loading, setLoading] = useState<boolean>(true);

  // Restore and verify session on initial mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const restoredUser = await authService.restoreSession();
        if (isMounted) {
          setUser(restoredUser);
          setSession(authService.getCurrentSession());
        }
      } catch (err) {
        console.warn('[AuthProvider] Session verification error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password?: string, facility?: string): Promise<User> => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password, facility);
      setUser(result.user);
      setSession({ user: result.user, token: result.token });
      return result.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signOut,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
