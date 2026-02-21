import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  if (typeof window !== 'undefined') {
    // Only warn in browser to avoid build time noise if envs are missing in CI
    console.warn('Supabase URL or Key is missing. Check your .env.local file.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
