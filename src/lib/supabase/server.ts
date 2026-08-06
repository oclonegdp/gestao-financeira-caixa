import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

/**
 * Creates a Supabase client for server-side or service-role interactions.
 * Accepts optional custom secret key or falls back to process environment variables.
 */
export const createServerSupabaseClient = (
  serviceRoleKey?: string
): SupabaseClient<Database> | null => {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || url === 'https://your-supabase-project.supabase.co' || !key) {
    return null;
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
