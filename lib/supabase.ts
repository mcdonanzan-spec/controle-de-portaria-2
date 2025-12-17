
import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente devem ser configuradas no seu ambiente de desenvolvimento
// Para este exemplo, assumimos que estão disponíveis em process.env
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
