
import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente devem ser configuradas na Vercel (Settings > Environment Variables)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'ERRO: Variáveis de ambiente do Supabase não encontradas! ' +
    'Verifique se SUPABASE_URL e SUPABASE_ANON_KEY estão configuradas na Vercel.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
