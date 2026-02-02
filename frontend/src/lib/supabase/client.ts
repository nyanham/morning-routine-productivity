import { createBrowserClient } from '@supabase/ssr';

// Placeholder values for build time - actual values come from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
