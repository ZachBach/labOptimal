/**
 * Auth state: holds the JWT + user, persists the token securely, and restores
 * the session on boot. Exposes sign in / sign up / guest / sign out.
 *
 * "Guest" is a first-class mode so the app stays demoable without the Node API:
 * a guest has no token and the scan flow talks to the engine directly (or falls
 * back to sample data). A signed-in user gets the persisted, history-backed flow.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as api from '@/api/apiClient';
import { clearToken, loadToken, saveToken } from '@/api/tokenStore';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'guest';

interface AuthState {
  status: AuthStatus;
  token: string | null;
  user: api.AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<api.AuthUser | null>(null);

  // Restore a persisted session on boot, validating the token against /auth/me.
  useEffect(() => {
    let active = true;
    (async () => {
      const saved = await loadToken();
      if (!saved) {
        if (active) setStatus('signedOut');
        return;
      }
      try {
        const u = await api.me(saved);
        if (!active) return;
        if (u) {
          setToken(saved);
          setUser(u);
          setStatus('signedIn');
        } else {
          await clearToken();
          setStatus('signedOut');
        }
      } catch {
        // Network error on boot: keep the token but require re-entry so we don't
        // wedge the app offline. Treat as signed out for routing.
        if (active) setStatus('signedOut');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const apply = useCallback(async (result: api.AuthResult) => {
    await saveToken(result.token);
    setToken(result.token);
    setUser(result.user);
    setStatus('signedIn');
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await apply(await api.login(email, password));
    },
    [apply],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      await apply(await api.signup(email, password));
    },
    [apply],
  );

  const continueAsGuest = useCallback(() => {
    setToken(null);
    setUser(null);
    setStatus('guest');
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo<AuthState>(
    () => ({ status, token, user, signIn, signUp, continueAsGuest, signOut }),
    [status, token, user, signIn, signUp, continueAsGuest, signOut],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
