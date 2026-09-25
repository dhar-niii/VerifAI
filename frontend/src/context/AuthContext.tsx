import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Operator } from '../types';

const OPERATOR_KEY = 'verifai.operator';

interface AuthContextValue {
  operator: Operator | null;
  login: (serviceId: string, remember: boolean, overrides?: Partial<Operator>) => Operator;
  signup: (data: { fullName: string; rank: string; email: string; badgeId: string }) => Operator;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStored(): Operator | null {
  try {
    const raw = localStorage.getItem(OPERATOR_KEY);
    return raw ? (JSON.parse(raw) as Operator) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [operator, setOperator] = useState<Operator | null>(() => readStored());

  useEffect(() => {
    try {
      if (operator) localStorage.setItem(OPERATOR_KEY, JSON.stringify(operator));
      else localStorage.removeItem(OPERATOR_KEY);
    } catch {
      /* storage unavailable */
    }
  }, [operator]);

  const login = useCallback((serviceId: string, remember: boolean, overrides?: Partial<Operator>) => {
    const next: Operator = {
      fullName: overrides?.fullName ?? 'Vikram Rao',
      rank: overrides?.rank ?? 'Sergeant',
      email: overrides?.email ?? (serviceId.includes('@') ? serviceId : `${serviceId.toLowerCase()}@verifai.local`),
      serviceId: overrides?.serviceId ?? (serviceId.includes('@') ? 'OP-114' : serviceId),
      badgeId: overrides?.badgeId ?? 'SB-47-0114',
    };
    if (!remember) {
      // Session-only: keep in memory but mirror to sessionStorage semantics.
      try {
        sessionStorage.setItem(OPERATOR_KEY, JSON.stringify(next));
        localStorage.removeItem(OPERATOR_KEY);
      } catch {
        /* ignore */
      }
    }
    setOperator(next);
    return next;
  }, []);

  const signup = useCallback((data: { fullName: string; rank: string; email: string; badgeId: string }) => {
    const next: Operator = {
      fullName: data.fullName,
      rank: data.rank,
      email: data.email,
      serviceId: data.badgeId,
      badgeId: data.badgeId,
    };
    setOperator(next);
    return next;
  }, []);

  const logout = useCallback(() => setOperator(null), []);

  const value = useMemo(() => ({ operator, login, signup, logout }), [operator, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
