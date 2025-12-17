
import React, { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { BuildingIcon, LockClosedIcon, UserIcon, XCircleIcon } from './icons';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);

    useEffect(() => {
        if (!isConfigured) {
            setMessage({ 
                text: '⚠️ Chaves não detectadas! Siga este checklist:\n1. Na Vercel, digite o nome da chave e clique em "Add" ANTES de clicar em "Salvar".\n2. Verifique se não há espaços extras.\n3. Após salvar, você DEVE fazer um "Redeploy" na aba Deployments.', 
                type: 'warning' 
            });
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!isConfigured) {
            setMessage({ text: 'Erro: O aplicativo não tem permissão para acessar o banco de dados. Configure as variáveis de ambiente na Vercel.', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage({ text: 'Cadastro realizado! Tente entrar agora.', type: 'success' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            console.error("Auth Error:", error);
            setMessage({ 
                text: error.message === 'Failed to fetch' 
                    ? 'Erro de conexão: Verifique se a SUPABASE_URL está correta (ex: https://xyz.supabase.co).' 
                    : error.message, 
                type: 'error' 
            });
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
                </div>
                
                <form onSubmit={handleAuth} className="p-8 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-md text-xs font-semibold border whitespace-pre-line ${
                            message.type === 'error' ? 'bg-red-900/20 text-red-400 border-red-900/50' : 
                            message.type === 'warning' ? 'bg-amber-900/20 text-amber-400 border-amber-900/50' : 
                            'bg-green-900/20 text-green-400 border-green-900/50'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div>
                        <label className="block text-brand-text-muted text-xs font-bold uppercase mb-2">E-mail</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-brand-text-muted" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-brand-steel border-brand-slate border rounded py-2 pl-10 pr-3 text-brand-text outline-none focus:border-brand-amber" placeholder="usuario@obra.com.br" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-brand-text-muted text-xs font-bold uppercase mb-2">Senha</label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-2.5 h-5 w-5 text-brand-text-muted" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-brand-steel border-brand-slate border rounded py-2 pl-10 pr-3 text-brand-text outline-none focus:border-brand-amber" placeholder="••••••••" required />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-brand-amber hover:bg-amber-600 text-brand-charcoal font-black py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest">
                        {loading ? 'Carregando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
                    </button>

                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-brand-text-muted text-xs hover:text-brand-amber">
                        {isSignUp ? 'Já tem conta? Entrar' : 'Primeiro acesso? Cadastrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
