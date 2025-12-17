
import { createClient } from '@supabase/supabase-js';

/**
 * Tenta encontrar as chaves do Supabase em diversas variações de ambiente.
 * Alguns ambientes (como Vite ou Next.js) exigem prefixos específicos.
 */
const getEnv = (key: string): string => {
  const variations = [
    key,
    `VITE_${key}`,
    `NEXT_PUBLIC_${key}`,
    `REACT_APP_${key}`
  ];

  try {
    // Busca em process.env
    if (typeof process !== 'undefined' && process.env) {
      for (const v of variations) {
        if (process.env[v]) return process.env[v] as string;
      }
    }
    // Busca em import.meta.env
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      for (const v of variations) {
        // @ts-ignore
        if (import.meta.env[v]) return import.meta.env[v] as string;
      }
    }
  } catch (e) {
    // Silently fail
  }
  return '';
};

const rawUrl = getEnv('SUPABASE_URL');
const rawKey = getEnv('SUPABASE_ANON_KEY');

// Limpeza rigorosa
export const supabaseUrl = rawUrl.trim().replace(/['"]/g, '').replace(/\/$/, '');
export const supabaseAnonKey = rawKey.trim().replace(/['"]/g, '');

// Critérios de configuração válida
export const isConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey.length > 20; // Chaves Anon costumam ser longas

// Log de diagnóstico técnico no console (F12)
if (typeof window !== 'undefined') {
  console.group('🔧 Status da Conexão Supabase');
  console.log('URL Configurada:', !!supabaseUrl);
  console.log('Chave Configurada:', !!supabaseAnonKey);
  console.log('Tamanho da Chave:', supabaseAnonKey.length);
  console.log('Configuração Válida:', isConfigured);
  console.groupEnd();
}

const finalUrl = isConfigured ? supabaseUrl : 'https://missing-config.supabase.co';
const finalKey = isConfigured ? supabaseAnonKey : 'missing-key';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
