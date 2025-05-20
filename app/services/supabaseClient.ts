import { createClient } from '@supabase/supabase-js';

// Log for debugging
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);

// Only create the client when running in browser or when environment variables are available
// This prevents build-time errors
let supabase: ReturnType<typeof createClient> | null = null;

// Check if we're in a browser environment or have valid env vars
if (typeof window !== 'undefined' || (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)) {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
  
  // Only create the client if we have values
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
}

export { supabase }; 