
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BuildingIcon, LockClosedIcon, UserIcon } from './icons';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!email || !password) {
            setMessage({ text: 'Preencha todos os campos.', type: 'error' });
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
                setMessage({ text: 'Cadastro solicitado! Verifique seu e-mail para confirmar o acesso.', type: 'success' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            let errorMsg = error.message;
            if (errorMsg === 'Failed to fetch') {
                errorMsg = 'Erro de conexão: Verifique se as chaves do Supabase na Vercel estão corretas e se você fez o Redeploy.';
            } else if (errorMsg === 'Invalid login credentials') {
                errorMsg = 'E-mail ou senha incorretos.';
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
