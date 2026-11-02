import { User } from '../types';
import { authApi, setAuthToken } from './apiService';

const AUTH_USER_KEY = 'bharatdc_current_user';
const AUTH_TOKEN_KEY = 'bharatdc_auth_token';

export interface AuthSession {
  user: User;
  token: string;
  expiresAt?: number;
}

export const authService = {
  // Sign in with username or email and password
  signIn: async (identifier: string, password?: string, facility?: string): Promise<{ user: User; token: string }> => {
    const cleanId = identifier.trim();
    const cleanPass = password?.trim() || '';

    const response = await authApi.login({
      email: cleanId,
      username: cleanId,
      identifier: cleanId,
      password: cleanPass,
      facility: facility || 'MUM-1',
    });

    if (response && response.user) {
      const token = response.token || `supa-session-${response.user.id}`;
      setAuthToken(token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return { user: response.user, token };
    }

    throw new Error('Invalid username or password.');
  },

  // Sign out and clear stored sessions
  signOut: async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('[AuthService] Logout API notification error:', err);
    } finally {
      setAuthToken(null);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem('bdc_hero_intro_seen');
    }
  },

  // Get current active session
  getCurrentSession: (): AuthSession | null => {
    try {
      const userJson = localStorage.getItem(AUTH_USER_KEY);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (userJson && token) {
        const user = JSON.parse(userJson);
        return { user, token };
      }
    } catch (e) {
      console.error('[AuthService] Error reading cached session:', e);
    }
    return null;
  },

  // Get current authenticated user
  getCurrentUser: (): User | null => {
    const session = authService.getCurrentSession();
    return session ? session.user : null;
  },

  // Restore and verify user session with the backend API
  restoreSession: async (): Promise<User | null> => {
    const session = authService.getCurrentSession();
    if (!session) return null;

    try {
      setAuthToken(session.token);
      const res = await authApi.getMe();
      if (res && res.user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
        return res.user;
      }
    } catch {
      // Retain stored session offline if backend is unreachable
    }
    return session.user;
  },
};
