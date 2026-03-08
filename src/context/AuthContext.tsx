import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type PlanType = 'free' | 'pro' | 'business';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: PlanType;
  spreadsheetsUsed: number;
  maxSpreadsheets: number;
  authProvider: 'email' | 'google' | 'apple';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  upgradePlan: (plan: PlanType) => void;
  canUploadMore: () => boolean;
  incrementUploads: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setUser({
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      plan: 'free',
      spreadsheetsUsed: 0,
      maxSpreadsheets: 1,
      authProvider: 'email',
    });
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setUser({
      id: crypto.randomUUID(),
      name,
      email,
      plan: 'free',
      spreadsheetsUsed: 0,
      maxSpreadsheets: 1,
      authProvider: 'email',
    });
    setIsLoading(false);
  }, []);

  const socialLogin = useCallback(async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUser({
      id: crypto.randomUUID(),
      name: provider === 'google' ? 'Alex Johnson' : 'Alex',
      email: provider === 'google' ? 'alex@gmail.com' : 'alex@icloud.com',
      plan: 'free',
      spreadsheetsUsed: 0,
      maxSpreadsheets: 1,
      authProvider: provider,
    });
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const forgotPassword = useCallback(async (_email: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
  }, []);

  const resetPassword = useCallback(async (_password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
  }, []);

  const upgradePlan = useCallback((plan: PlanType) => {
    setUser(prev => prev ? {
      ...prev,
      plan,
      maxSpreadsheets: plan === 'free' ? 1 : Infinity,
    } : null);
  }, []);

  const canUploadMore = useCallback(() => {
    if (!user) return false;
    if (user.plan !== 'free') return true;
    return user.spreadsheetsUsed < user.maxSpreadsheets;
  }, [user]);

  const incrementUploads = useCallback(() => {
    setUser(prev => prev ? { ...prev, spreadsheetsUsed: prev.spreadsheetsUsed + 1 } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login, signup, socialLogin, logout,
      forgotPassword, resetPassword,
      upgradePlan, canUploadMore, incrementUploads,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
