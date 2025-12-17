
import React, { useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase.ts';
import { BuildingIcon, LockClosedIcon, UserIcon } from './icons.tsx';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isConfigured) {
            setMessage({ text: 'Erro de conexão: O sistema não foi configurado corretamente no arquivo lib/supabase.ts', type: 'error' });
            return;
        }
        
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage({ text: 'Cadastro realizado! Verifique seu e-mail ou faça login.', type: 'success' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ text: error.message || 'Erro ao acessar o sistema', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-charcoal p-4 font-sans">
            <div className="w-full max-w-md bg-brand-lead border border-brand-steel rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-brand-amber p-8 text-center">
                    <BuildingIcon className="w-12 h-12 mx-auto text-brand-charcoal mb-2" />
                    <h1 className="text-2xl font-black text-brand-charcoal uppercase tracking-tighter">Canteiro Seguro</h1>
                    <p className="text-xs text-brand-charcoal/70 font-bold uppercase tracking-widest">Controle de Portaria v2.0</p>
                </div>
                
                <div className="p-8">
                    {!isConfigured && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                            <p className="text-red-400 text-xs font-bold uppercase mb-1">⚠️ Erro de Instalação</p>
                            <p className="text-brand-text-muted text-[10px]">As chaves do Supabase não foram encontradas no código. O desenvolvedor precisa editar o arquivo <code className="text-brand-amber">lib/supabase.ts</code>.</p>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-5">
                        {message && (
                            <div className={`p-3 rounded-lg text-[11px] font-bold border ${
                                message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                                'bg-green-500/10 text-green-400 border-green-500/30'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-brand-text-muted uppercase ml-1">E-mail Corporativo</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-brand-text-muted" />
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-3 pl-10 pr-3 text-brand-text outline-none focus:border-brand-amber transition-all" 
                                    placeholder="exemplo@empresa.com"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-brand-text-muted uppercase ml-1">Senha de Acesso</label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3 top-3 h-4 w-4 text-brand-text-muted" />
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-3 pl-10 pr-3 text-brand-text outline-none focus:border-brand-amber transition-all" 
                                    placeholder="••••••••"
                                    required 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !isConfigured} 
                            className="w-full bg-brand-amber hover:bg-white text-brand-charcoal font-black py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg uppercase text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Validando...' : (isSignUp ? 'Finalizar Cadastro' : 'Entrar no Sistema')}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setIsSignUp(!isSignUp)} 
                            className="w-full text-brand-text-muted text-[10px] font-bold uppercase tracking-widest hover:text-brand-amber transition-colors"
                        >
                            {isSignUp ? 'Já tenho acesso' : 'Primeiro acesso? Solicitar cadastro'}
                        </button>
                    </form>
                </div>
            </div>
            <p className="fixed bottom-4 text-[9px] text-brand-text-muted/30 uppercase font-bold">Canteiro Seguro © 2024 - Sistema de Segurança Patrimonial</p>
        </div>
    );
};

export default Auth;
