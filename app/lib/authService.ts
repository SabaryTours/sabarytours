import { supabase } from './supabase';

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
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
  return;
};

// Now Async!
export const getUser = async () => {
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
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

export const forgotPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(error.message);
  return true;
};

export const resetPassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  return true;
};

