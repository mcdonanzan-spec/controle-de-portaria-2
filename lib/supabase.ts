
import { createClient } from '@supabase/supabase-js';

/**
 * Tenta encontrar as chaves do Supabase em diversas variações de nome.
 * Isso torna o app "à prova de erros" de digitação na Vercel.
 */
const getEnv = (keyVariations: string[]): string => {
  try {
    // 1. Tenta no process.env (Vercel/Node)
    if (typeof process !== 'undefined' && process.env) {
      for (const key of keyVariations) {
        if (process.env[key]) return process.env[key] as string;
        if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`] as string;
      }
    }
    // 2. Tenta no import.meta.env (Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      for (const key of keyVariations) {
        // @ts-ignore
        if (import.meta.env[key]) return import.meta.env[key] as string;
        // @ts-ignore
        if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`] as string;
      }
    }
  } catch (e) {
    // Erro silencioso
  }
  return '';
};

// Aceita URL_SUPABASE ou SUPABASE_URL
const rawUrl = getEnv(['SUPABASE_URL', 'URL_SUPABASE', 'DATABASE_URL']);
// Aceita SUPABASE_ANON_KEY ou ANON_KEY_SUPABASE ou SUPABASE_KEY
const rawKey = getEnv(['SUPABASE_ANON_KEY', 'ANON_KEY_SUPABASE', 'SUPABASE_KEY', 'CHAVE_SUPABASE']);

// Limpeza rigorosa
export const supabaseUrl = rawUrl.trim().replace(/['"]/g, '').replace(/\/$/, '');
export const supabaseAnonKey = rawKey.trim().replace(/['"]/g, '');

// Critérios de configuração válida
export const isConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey.length > 20;

// Log de diagnóstico técnico no console (F12)
if (typeof window !== 'undefined') {
  console.group('🔧 Status da Conexão Supabase');
  console.log('URL Detectada:', supabaseUrl ? 'Sim' : 'Não');
  console.log('Chave Detectada:', supabaseAnonKey ? 'Sim' : 'Não');
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
