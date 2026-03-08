import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type PlanType = 'free' | 'pro' | 'business';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  spreadsheetsUsed: number;
  maxSpreadsheets: number;
  authProvider: string;
}

interface AuthState {
  user: UserProfile | null;
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

function mapSupabaseUser(su: SupabaseUser, profile?: any): UserProfile {
  return {
    id: su.id,
    name: profile?.full_name || su.user_metadata?.full_name || su.user_metadata?.name || su.email?.split('@')[0] || '',
    email: su.email || '',
    plan: (profile?.plan as PlanType) || 'free',
    spreadsheetsUsed: profile?.spreadsheets_used ?? 0,
    maxSpreadsheets: profile?.max_spreadsheets ?? 1,
    authProvider: su.app_metadata?.provider || 'email',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (su: SupabaseUser) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', su.id)
      .single();
    setUser(mapSupabaseUser(su, data));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid Supabase deadlock during callback
        setTimeout(() => fetchProfile(session.user), 0);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setIsLoading(false); throw error; }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) { setIsLoading(false); throw error; }
  }, []);

  const socialLogin = useCallback(async (provider: 'google' | 'apple') => {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + '/upload',
    });
    if (result.error) throw result.error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const upgradePlan = useCallback(async (plan: PlanType) => {
    if (!user) return;
    const maxSheets = plan === 'free' ? 1 : 999999;
    await supabase
      .from('profiles')
      .update({ plan, max_spreadsheets: maxSheets })
      .eq('user_id', user.id);
    setUser(prev => prev ? { ...prev, plan, maxSpreadsheets: maxSheets } : null);
  }, [user]);

  const canUploadMore = useCallback(() => {
    if (!user) return false;
    if (user.plan !== 'free') return true;
    return user.spreadsheetsUsed < user.maxSpreadsheets;
  }, [user]);

  const incrementUploads = useCallback(async () => {
    if (!user) return;
    const newCount = user.spreadsheetsUsed + 1;
    await supabase
      .from('profiles')
      .update({ spreadsheets_used: newCount })
      .eq('user_id', user.id);
    setUser(prev => prev ? { ...prev, spreadsheetsUsed: newCount } : null);
  }, [user]);

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
