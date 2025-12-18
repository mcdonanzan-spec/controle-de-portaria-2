
import { createClient } from '@supabase/supabase-js';

/** 
 * 🛠️ CONFIGURAÇÃO DE ACESSO (PARA FUNCIONAR EM TODOS OS CELULARES)
 * ----------------------------------------------------------------
 * Sistema configurado com as chaves do projeto.
 */
const CONFIG = {
  // URL sincronizada com a chave fornecida (ID: fjpeafeudzyfgnghxfafa)
  URL: 'https://fjpeafeudzyfgnghxfafa.supabase.co', 
  
  // Chave ANON de produção configurada
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcGVhZmV1ZHp5ZmduZ2h4YWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMDU1NjEsImV4cCI6MjA4MTU4MTU2MX0.Sqo6dIZL7XcrJ65pTZ7IKysWpA_zB4i3i6Sp4Wjj--M' 
};

// --- O código abaixo gerencia a conexão automaticamente ---

const tryGetEnv = (key: string): string => {
  try {
    // @ts-ignore
    const env = (typeof process !== 'undefined' && process.env ? process.env[key] : null) || 
                // @ts-ignore
                (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : null);
    return env ? String(env).trim().replace(/['"]/g, '') : '';
  } catch { return ''; }
};

const finalUrl = CONFIG.URL || localStorage.getItem('__config_SUPABASE_URL') || tryGetEnv('SUPABASE_URL');
const finalKey = CONFIG.ANON_KEY || localStorage.getItem('__config_SUPABASE_ANON_KEY') || tryGetEnv('SUPABASE_ANON_KEY');

export const isConfigured = !!(finalUrl && finalUrl.startsWith('http') && finalKey && finalKey.length > 20 && finalKey !== 'SUA_CHAVE_ANON_AQUI');

export const supabase = createClient(
  isConfigured ? finalUrl : 'https://waiting.supabase.co',
  isConfigured ? finalKey : 'waiting-key'
);

(window as any).__SUPABASE_DIAGNOSTIC__ = {
  isConfigured,
  resetConfig: () => {
    localStorage.clear();
    window.location.reload();
  }
};
