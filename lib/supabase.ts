
import { createClient } from '@supabase/supabase-js';

// Configuração corrigida com base no seu print: fjpeafeudzyfgnghxafa
const PROJECT_REF = 'fjpeafeudzyfgnghxafa';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcGVhZmV1ZHp5ZmduZ2h4YWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMDU1NjEsImV4cCI6MjA4MTU4MTU2MX0.Sqo6dIZL7XcrJ65pTZ7IKysWpA_zB4i3i6Sp4Wjj--M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const isConfigured = true;
