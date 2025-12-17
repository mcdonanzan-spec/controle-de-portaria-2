
import { createClient } from '@supabase/supabase-js';

// Função segura para pegar variáveis de ambiente sem travar o app
const getEnv = (key: string): string => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env[key]) || '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Se as chaves estiverem vazias, o cliente será criado com placeholders
// O componente Auth.tsx já está preparado para mostrar o erro amigável "Failed to fetch"
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
