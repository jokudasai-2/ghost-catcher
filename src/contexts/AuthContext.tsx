import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.access_token) {
        saveAuthTokenToExtension(session.access_token);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          await ensureUserProfile(session.user);
        }

        if (session?.access_token) {
          saveAuthTokenToExtension(session.access_token);
        } else {
          clearAuthTokenFromExtension();
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const saveAuthTokenToExtension = (token: string) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ supabase_auth_token: token });
    }
  };

  const clearAuthTokenFromExtension = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove('supabase_auth_token');
    }
  };

  const ensureUserProfile = async (authUser: User) => {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .maybeSingle();

    if (!existingUser) {
      const displayName = authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User';

      await supabase.from('users').insert({
        auth_id: authUser.id,
        user_id: authUser.email || authUser.id,
        email: authUser.email || '',
        display_name: displayName,
        first_name: authUser.user_metadata?.first_name || '',
        last_name: authUser.user_metadata?.last_name || '',
        total_points: 0,
        level: 1,
        is_admin: false,
      });

      const { data: newUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single();

      if (newUser) {
        await supabase.from('user_stats').insert({
          user_id: newUser.id,
          ghosts_resolved: 0,
          average_resolution_time: 0,
          streak: 0,
          weekly_points: 0,
          weekly_ghosts_resolved: 0,
        });
      }
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
