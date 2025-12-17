
import React, { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { BuildingIcon, LockClosedIcon, UserIcon } from './icons';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);

    // Verifica configuração ao carregar
    useEffect(() => {
        if (!isConfigured) {
            setMessage({ 
                text: 'Atenção: O sistema não detectou as chaves do Supabase. Verifique se as variáveis SUPABASE_URL e SUPABASE_ANON_KEY foram adicionadas na Vercel e se você fez um novo "Redeploy".', 
                type: 'warning' 
            });
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!isConfigured) {
            setMessage({ text: 'Erro crítico: As chaves de acesso ao banco de dados não foram encontradas no ambiente.', type: 'error' });
            setLoading(false);
            return;
        }

        if (!email || !password) {
            setMessage({ text: 'Preencha e-mail e senha.', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: {
                        emailRedirectTo: window.location.origin
                    }
                });
                
                if (error) throw error;
                
                if (data?.user && !data?.session) {
                    setMessage({ text: 'Acesso solicitado! Tente fazer login agora (como a confirmação de e-mail está off, deve funcionar direto).', type: 'success' });
                } else if (data?.session) {
                    setMessage({ text: 'Conta criada e logada com sucesso!', type: 'success' });
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            console.error("Auth Error:", error);
            let errorMsg = error.message;
            
            // Tratamento amigável de erros técnicos
            if (errorMsg === 'Failed to fetch' || errorMsg.includes('NetworkError')) {
                errorMsg = 'Erro de Conexão: O app não conseguiu falar com o Supabase. Isso geralmente é causado por uma URL incorreta na Vercel ou o projeto do Supabase estar pausado.';
            } else if (errorMsg === 'Invalid login credentials') {
                errorMsg = 'E-mail ou senha incorretos.';
            } else if (errorMsg.includes('Email confirmation')) {
                errorMsg = 'O Supabase ainda está exigindo confirmação de e-mail. Verifique sua caixa de entrada ou desative essa opção no painel do Supabase.';
            }
            
            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-charcoal p-4">
            <div className="w-full max-w-md bg-brand-lead border border-brand-steel rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-brand-amber p-8 text-center">
                    <BuildingIcon className="w-16 h-16 mx-auto text-brand-charcoal mb-4" />
                    <h1 className="text-2xl font-bold text-brand-charcoal uppercase tracking-widest">Portaria Obras</h1>
                    <p className="text-brand-charcoal font-medium opacity-80">Acesso Restrito ao Canteiro</p>
                </div>
                
                <form onSubmit={handleAuth} className="p-8 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-md text-sm font-semibold border ${
                            message.type === 'error' 
                            ? 'bg-feedback-error/20 text-feedback-error border-feedback-error/30' 
                            : message.type === 'warning'
                            ? 'bg-brand-amber/20 text-brand-amber border-brand-amber/30'
                            : 'bg-feedback-success/20 text-feedback-success border-feedback-success/30'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div>
                        <label className="block text-brand-text-muted text-xs font-bold uppercase mb-2">E-mail Corporativo</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-brand-text-muted" />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-brand-steel border-brand-slate border rounded py-2 pl-10 pr-3 text-brand-text focus:border-brand-amber transition-colors outline-none" 
                                placeholder="usuario@obra.com.br"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-brand-text-muted text-xs font-bold uppercase mb-2">Senha de Acesso</label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-2.5 h-5 w-5 text-brand-text-muted" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-brand-steel border-brand-slate border rounded py-2 pl-10 pr-3 text-brand-text focus:border-brand-amber transition-colors outline-none" 
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-amber hover:bg-amber-600 text-brand-charcoal font-black py-3 rounded-lg transition-all transform active:scale-95 disabled:bg-brand-slate disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-widest"
                    >
                        {loading ? 'Processando...' : (isSignUp ? 'Criar Acesso' : 'Entrar no Sistema')}
                    </button>

                    <div className="text-center pt-4 border-t border-brand-steel">
                        <button 
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setMessage(null);
                            }}
                            className="text-brand-text-muted text-xs hover:text-brand-amber transition-colors"
                        >
                            {isSignUp ? 'Já possui acesso? Faça login' : 'Primeiro acesso? Solicite cadastro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Auth;
