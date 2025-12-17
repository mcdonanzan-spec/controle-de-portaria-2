
import { createClient } from '@supabase/supabase-js';

/**
 * Função expert para capturar variáveis de ambiente.
 * No navegador, dependendo do bundler (Vite, Webpack, etc.), 
 * as variáveis podem estar em process.env ou import.meta.env.
 */
const getEnv = (key: string): string => {
  try {
    // 1. Tenta o padrão Node/Vercel
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] || '';
    }
    // 2. Tenta o padrão Vite/ESM
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key] || '';
    }
    // 3. Tenta window.env (caso de injeção manual)
    // @ts-ignore
    if (typeof window !== 'undefined' && window._env_ && window._env_[key]) {
      // @ts-ignore
      return window._env_[key] || '';
    }
  } catch (e) {
    console.warn(`Erro ao tentar acessar a variável ${key}:`, e);
  }
  return '';
};

const rawUrl = getEnv('SUPABASE_URL');
const rawKey = getEnv('SUPABASE_ANON_KEY');

// Limpeza de strings (remove espaços, aspas ou barras extras)
export const supabaseUrl = rawUrl.trim().replace(/['"]/g, '').replace(/\/$/, '');
export const supabaseAnonKey = rawKey.trim().replace(/['"]/g, '');

// Verifica se a configuração é válida
export const isConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('configuracao-ausente');

// Log de diagnóstico (apenas no console para o desenvolvedor ver se as chaves chegaram)
if (typeof window !== 'undefined') {
    if (!isConfigured) {
        console.group('🛠️ Diagnóstico Supabase');
        console.warn('Status: ❌ NÃO CONFIGURADO');
        console.log('SUPABASE_URL detectada:', supabaseUrl ? 'Sim (mas verifique o formato)' : 'Não');
        console.log('SUPABASE_ANON_KEY detectada:', supabaseAnonKey ? 'Sim' : 'Não');
        console.groupEnd();
    } else {
        console.log('🛠️ Supabase configurado com sucesso!');
    }
}

// Se não estiver configurado, usamos URLs que falham de forma previsível
const finalUrl = isConfigured ? supabaseUrl : 'https://projeto-nao-configurado.supabase.co';
const finalKey = isConfigured ? supabaseAnonKey : 'chave-nao-configurada';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
