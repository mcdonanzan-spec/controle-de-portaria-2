
import { createClient } from '@supabase/supabase-js';

// Função ultra-robusta para capturar variáveis de qualquer lugar
const tryGet = (key: string): string => {
  try {
    // 1. Tenta LocalStorage (prioridade para correções manuais)
    const saved = localStorage.getItem(`__config_${key}`);
    if (saved) return saved.trim();

    // 2. Tenta process.env (Vercel/Node)
    // @ts-ignore
    const env = (typeof process !== 'undefined' && process.env ? process.env[key] : null) || 
                // @ts-ignore
                (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : null) ||
                // @ts-ignore
                (typeof window !== 'undefined' ? window[key] : null);
    
    return env ? String(env).trim().replace(/['"]/g, '') : '';
  } catch (e) {
    return '';
  }
};

// Busca URL e Key usando múltiplos aliases comuns
const url = tryGet('SUPABASE_URL') || tryGet('URL_SUPABASE') || tryGet('VITE_SUPABASE_URL');
const key = tryGet('SUPABASE_ANON_KEY') || tryGet('ANON_KEY_SUPABASE') || tryGet('VITE_SUPABASE_ANON_KEY');

// Validação rigorosa
export const isConfigured = url.startsWith('http') && key.length > 20;

// Configuração de fallback para evitar crash na inicialização
const finalUrl = isConfigured ? url : 'https://waiting-for-config.supabase.co';
const finalKey = isConfigured ? key : 'waiting-for-config-key';

// Expõe diagnóstico global para o componente Auth
(window as any).__SUPABASE_DIAGNOSTIC__ = {
  urlFound: !!url && url !== 'https://waiting-for-config.supabase.co',
  keyFound: !!key && key !== 'waiting-for-config-key',
  isConfigured,
  saveConfig: (newUrl: string, newKey: string) => {
    localStorage.setItem('__config_SUPABASE_URL', newUrl);
    localStorage.setItem('__config_SUPABASE_ANON_KEY', newKey);
    window.location.reload();
  },
  resetConfig: () => {
    localStorage.removeItem('__config_SUPABASE_URL');
    localStorage.removeItem('__config_SUPABASE_ANON_KEY');
    window.location.reload();
  }
};

export const supabase = createClient(finalUrl, finalKey);
