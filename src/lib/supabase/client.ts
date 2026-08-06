import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

const dummyClient = new Proxy({} as SupabaseClient<Database>, {
  get: () => () => { throw new Error('Supabase não configurado'); },
});

export const supabase: SupabaseClient<Database> = 
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : dummyClient;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  return isSupabaseConfigured() ? supabase : null;
};
