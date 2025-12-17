
import { createClient } from '@supabase/supabase-js';

const tryGet = (key: string): string => {
  try {
    // @ts-ignore
    const val = (typeof process !== 'undefined' && process.env ? process.env[key] : null) || 
                // @ts-ignore
                (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : null) ||
                // @ts-ignore
                (typeof window !== 'undefined' ? window[key] : null);
    return val ? String(val).trim().replace(/['"]/g, '') : '';
  } catch (e) {
    return '';
  }
};

const url = tryGet('SUPABASE_URL') || tryGet('URL_SUPABASE');
const key = tryGet('SUPABASE_ANON_KEY') || tryGet('ANON_KEY_SUPABASE');

export const isConfigured = url.startsWith('http') && key.length > 20;

// Configurações de fallback seguras
const finalUrl = isConfigured ? url : 'https://missing.supabase.co';
const finalKey = isConfigured ? key : 'missing-key';

// Expõe diagnóstico para a UI
(window as any).__SUPABASE_DIAGNOSTIC__ = {
  urlFound: !!url,
  keyFound: !!key,
  isConfigured
};

export const supabase = createClient(finalUrl, finalKey);
