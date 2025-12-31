import { createClient } from '@supabase/supabase-js';

const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is not defined in environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseKey);

export default supabase