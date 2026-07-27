import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to .env locally and to the Vercel project settings.",
  );
}

// The anon key is meant to be public and ships in the bundle. Access is controlled
// by the row level security policies in supabase/migrations, not by hiding this key.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
