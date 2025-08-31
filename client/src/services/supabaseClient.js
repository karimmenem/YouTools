// Supabase client (optional production backend)
// Provide env vars REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Vercel.
// If not set, services fall back to Mirage/local storage.
import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = (url && key) ? createClient(url, key, { auth: { persistSession: false } }) : null;
