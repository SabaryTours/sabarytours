import { createClient } from '../utils/supabase/client';

export interface LoginCredentials {
  email: string; // Changed from username to email for Supabase default
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  username?: string;
  phone?: string;
}

export interface AuthResponse {
  user: any;
  error?: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  // Fetch profile to get names
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    user: { ...data.user, ...profile },
  };
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        phone: data.phone
      }
    }
  });

  if (authError) {
    return { user: null, error: authError.message };
  }

  return { user: authData.user };
};

export const logout = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
  return;
};

// Now Async!
export const getUser = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get profile data too
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { ...user, ...profile };
};

export const isAuthenticated = async (): Promise<boolean> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
};

/** Sends reset link via Resend (server API) — avoids Supabase built-in email rate limits. */
export const forgotPassword = async (email: string) => {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    const msg = data.message || data.error || "Failed to send reset email.";
    throw new Error(msg);
  }
  return true;
};

export const resetPassword = async (password: string) => {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  return true;
};

export const getUserRole = async (): Promise<'admin' | 'subscriber'> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'subscriber';

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin' ? 'admin' : 'subscriber';
};
