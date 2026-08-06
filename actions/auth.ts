// actions/auth.ts
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { type ActionResponse } from './transactions';

export async function signInWithEmail(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Please provide both email and password' };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { success: false, message: 'Server configuration error. Please contact support.' };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey);

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Successfully signed in!' };
  } catch {
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signUpWithEmail(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Please provide both email and password' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { success: false, message: 'Server configuration error. Please contact support.' };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey);

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.VITE_SUPABASE_URL}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Check your email for the confirmation link!' };
  } catch {
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signOut(): Promise<{ success: boolean; message: string }> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { success: false, message: 'Server configuration error. Please contact support.' };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey);

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, message: error.message };
    }

    redirect('/login');
    return { success: true, message: 'Successfully signed out!' };
  } catch {
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getCurrentUser() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}