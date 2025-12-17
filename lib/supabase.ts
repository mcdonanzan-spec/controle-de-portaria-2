
import { createClient } from '@supabase/supabase-js';

// Função para tentar capturar variáveis de ambiente de forma segura no navegador
const getEnv = (key: string): string => {
  try {
    // Tenta process.env (Vercel)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] || '';
    }
    // Tenta import.meta.env (Vite/Modern ESM)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key] || '';
    }
  } catch (e) {
    // Silently fail, keys will be empty
  }
  return '';
};

let supabaseUrl = getEnv('SUPABASE_URL').trim();
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY').trim();

// LIMPEZA EXPERT: Garante que a URL não tenha barra no final e tenha o protocolo correto
if (supabaseUrl) {
  supabaseUrl = supabaseUrl.replace(/\/$/, '');
  if (!supabaseUrl.startsWith('http')) {
    supabaseUrl = `https://${supabaseUrl}`;
  }
}

// Verifica se a configuração é válida (não é vazia e não é o placeholder antigo)
export const isConfigured = !!supabaseUrl && 
                           !!supabaseAnonKey && 
                           !supabaseUrl.includes('placeholder') &&
                           !supabaseUrl.includes('missing-configuration');

// Se não estiver configurado, usa um domínio que gerará um erro claro de DNS
const finalUrl = isConfigured ? supabaseUrl : 'https://configuracao-ausente.supabase.co';
const finalKey = isConfigured ? supabaseAnonKey : 'chave-ausente';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
