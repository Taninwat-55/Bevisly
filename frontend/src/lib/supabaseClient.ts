import { createClient } from "@supabase/supabase-js";
import type { Database } from "./Database";

// Environment variables from your .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Create a single Supabase client instance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
