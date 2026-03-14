// ================================================
// supabase-client.js
// Initializes and exports the Supabase client.
// Replace SUPABASE_URL and SUPABASE_ANON_KEY with
// your actual project values from supabase.com
// ================================================

// Reads config injected via window.APP_CONFIG (set in each HTML page)
const SUPABASE_URL = window.APP_CONFIG?.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = window.APP_CONFIG?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabaseClient };
