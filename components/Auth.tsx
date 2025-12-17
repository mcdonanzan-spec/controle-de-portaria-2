
import React, { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { BuildingIcon, LockClosedIcon, UserIcon } from './icons';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);
    const [diagnostic, setDiagnostic] = useState<any>(null);

    useEffect(() => {
        const diag = (window as any).__SUPABASE_DIAGNOSTIC__;
        setDiagnostic(diag);
        
        if (!isConfigured) {
            setMessage({ 
                text: '🚨 Sistema Desconectado: As chaves não foram propagadas para o código.', 
                type: 'warning' 
            });
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConfigured) return;
        
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage({ text: 'Conta criada! Verifique seu e-mail ou tente entrar.', type: 'success' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-charcoal p-4 font-sans">
            <div className="w-full max-w-md bg-brand-lead border border-brand-steel rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-brand-amber p-8 text-center">
                    <BuildingIcon className="w-12 h-12 mx-auto text-brand-charcoal mb-3" />
                    <h1 className="text-xl font-black text-brand-charcoal uppercase tracking-tighter">Canteiro Seguro</h1>
                    <p className="text-[10px] text-brand-charcoal/70 font-bold uppercase tracking-widest">Controle de Portaria v2.0</p>
                </div>
                
                <form onSubmit={handleAuth} className="p-8 space-y-5">
                    {/* Painel de Diagnóstico para o Usuário */}
                    {!isConfigured && diagnostic && (
                        <div className="bg-black/40 border border-brand-steel rounded-lg p-3 text-[10px] font-mono text-brand-text-muted space-y-1">
                            <p className="text-brand-amber font-bold mb-1">DADOS DETECTADOS PELO APP:</p>
                            <p>URL: <span className={diagnostic.urlFound ? 'text-green-500' : 'text-red-500'}>{diagnostic.urlFound ? `DETECTADA (${diagnostic.urlStart})` : 'NÃO ENCONTRADA'}</span></p>
                            <p>CHAVE: <span className={diagnostic.keyFound ? 'text-green-500' : 'text-red-500'}>{diagnostic.keyFound ? `DETECTADA (${diagnostic.keyLength} chars)` : 'NÃO ENCONTRADA'}</span></p>
                            <div className="mt-2 pt-2 border-t border-brand-steel text-white/50 italic">
                                Se você já salvou na Vercel, clique em "Redeploy" na aba Deployments para forçar a atualização.
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`p-4 rounded-lg text-xs font-bold border ${
                            message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                            message.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
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
                                className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2.5 pl-10 pr-3 text-brand-text outline-none focus:border-brand-amber transition-all" 
                                placeholder="nome@empresa.com.br"
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
                                className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2.5 pl-10 pr-3 text-brand-text outline-none focus:border-brand-amber transition-all" 
                                placeholder="••••••••"
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !isConfigured} 
                        className="w-full bg-brand-amber hover:bg-amber-600 disabled:bg-brand-steel disabled:text-brand-text-muted text-brand-charcoal font-black py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg uppercase text-sm tracking-wider"
                    >
                        {loading ? 'Verificando...' : (isSignUp ? 'Criar Nova Conta' : 'Entrar no Sistema')}
                    </button>

                    <button 
                        type="button" 
                        onClick={() => setIsSignUp(!isSignUp)} 
                        className="w-full text-brand-text-muted text-[10px] font-bold uppercase tracking-widest hover:text-brand-amber transition-colors"
                    >
                        {isSignUp ? 'Já possui acesso? Clique aqui' : 'Primeiro acesso? Solicitar cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
