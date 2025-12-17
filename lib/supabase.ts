
import { createClient } from '@supabase/supabase-js';

/** 
 * 🛠️ CONFIGURAÇÃO DE ACESSO (PARA FUNCIONAR EM TODOS OS CELULARES)
 * ----------------------------------------------------------------
 * Cole abaixo os valores que você pegou no painel do Supabase.
 * Isso fará com que o app funcione automaticamente em qualquer aparelho.
 */
const CONFIG = {
  // Ex: 'https://xyzcompany.supabase.co'
  URL: 'https://fjpeafeudzyfgnghshps.supabase.co', 
  
  // Ex: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  ANON_KEY: 'SUA_CHAVE_ANON_AQUI' 
};

// --- Não altere nada abaixo desta linha ---

const tryGetEnv = (key: string): string => {
  try {
    // @ts-ignore
    const env = (typeof process !== 'undefined' && process.env ? process.env[key] : null) || 
                // @ts-ignore
                (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : null);
    return env ? String(env).trim().replace(/['"]/g, '') : '';
  } catch { return ''; }
};

// Prioridade 1: Código (Hardcoded) | Prioridade 2: LocalStorage | Prioridade 3: Variáveis de Ambiente
const finalUrl = CONFIG.URL || localStorage.getItem('__config_SUPABASE_URL') || tryGetEnv('SUPABASE_URL') || tryGetEnv('URL_SUPABASE');
const finalKey = CONFIG.ANON_KEY || localStorage.getItem('__config_SUPABASE_ANON_KEY') || tryGetEnv('SUPABASE_ANON_KEY') || tryGetEnv('ANON_KEY_SUPABASE');

export const isConfigured = !!(finalUrl && finalUrl.startsWith('http') && finalKey && finalKey.length > 20);

// Diagnóstico para o desenvolvedor no console do navegador
if (!isConfigured) {
  console.warn("⚠️ Supabase não configurado. Adicione as chaves em lib/supabase.ts");
}

export const supabase = createClient(
  isConfigured ? finalUrl : 'https://waiting.supabase.co',
  isConfigured ? finalKey : 'waiting-key'
);

// Expõe para o sistema de emergência caso precise resetar
(window as any).__SUPABASE_DIAGNOSTIC__ = {
  isConfigured,
  saveConfig: (u: string, k: string) => {
    localStorage.setItem('__config_SUPABASE_URL', u);
    localStorage.setItem('__config_SUPABASE_ANON_KEY', k);
    window.location.reload();
  },
  resetConfig: () => {
    localStorage.clear();
    window.location.reload();
  }
};
