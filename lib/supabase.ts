
import { createClient } from '@supabase/supabase-js';

// Função para tentar capturar a variável de qualquer lugar possível
const tryGet = (key: string): string | undefined => {
  // @ts-ignore
  return process?.env?.[key] || 
         // @ts-ignore
         process?.env?.[`VITE_${key}`] || 
         // @ts-ignore
         import.meta?.env?.[key] || 
         // @ts-ignore
         import.meta?.env?.[`VITE_${key}`] ||
         window?.[key as any];
};

const rawUrl = tryGet('SUPABASE_URL') || tryGet('URL_SUPABASE') || '';
const rawKey = tryGet('SUPABASE_ANON_KEY') || tryGet('ANON_KEY_SUPABASE') || '';

export const supabaseUrl = rawUrl.trim().replace(/['"]/g, '').replace(/\/$/, '');
export const supabaseAnonKey = rawKey.trim().replace(/['"]/g, '');

export const isConfigured = 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey.length > 30; // Chaves anon são geralmente bem longas

// Expõe para o componente Auth conseguir mostrar o que está acontecendo
(window as any).__SUPABASE_DIAGNOSTIC__ = {
  urlFound: !!supabaseUrl,
  urlStart: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'nulo',
  keyFound: !!supabaseAnonKey,
  keyLength: supabaseAnonKey.length,
  isConfigured
};

const finalUrl = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = isConfigured ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);
