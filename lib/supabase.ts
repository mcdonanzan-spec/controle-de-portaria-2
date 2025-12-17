
import { createClient } from '@supabase/supabase-js';

// Na Vercel, as variáveis devem ser definidas exatamente com esses nomes
// Se estiver usando Vite, elas precisariam do prefixo VITE_, 
// mas aqui usamos process.env conforme o ambiente configurado.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.warn('Configuração do Supabase ausente. Verifique as variáveis de ambiente na Vercel.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
