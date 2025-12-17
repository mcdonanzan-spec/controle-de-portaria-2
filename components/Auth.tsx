
import React, { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase.ts';
import { BuildingIcon, LockClosedIcon, UserIcon, CheckCircleIcon } from './icons.tsx';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);
    
    // Estados para configuração manual
    const [showManualConfig, setShowManualConfig] = useState(!isConfigured);
    const [manualUrl, setManualUrl] = useState('');
    const [manualKey, setManualKey] = useState('');

    const handleSaveManualConfig = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualUrl && manualKey) {
            (window as any).__SUPABASE_DIAGNOSTIC__.saveConfig(manualUrl, manualKey);
        }
    };

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
                <div className="bg-brand-amber p-6 text-center">
                    <BuildingIcon className="w-10 h-10 mx-auto text-brand-charcoal mb-2" />
                    <h1 className="text-xl font-black text-brand-charcoal uppercase tracking-tighter">Canteiro Seguro</h1>
                    <p className="text-[10px] text-brand-charcoal/70 font-bold uppercase tracking-widest">Controle de Portaria</p>
                </div>
                
                <div className="p-8">
                    {/* Seção de Configuração Manual (Apenas se falhar o automático) */}
                    {showManualConfig ? (
                        <div className="space-y-4">
                            <div className="bg-brand-steel/50 border border-brand-amber/30 p-4 rounded-xl">
                                <h2 className="text-brand-amber font-bold text-sm uppercase mb-2 flex items-center">
                                    <span className="mr-2">⚙️</span> Configuração Necessária
                                </h2>
                                <p className="text-[11px] text-brand-text-muted leading-relaxed mb-4">
                                    As chaves da Vercel não foram detectadas no navegador. Cole-as abaixo para ativar o sistema.
                                </p>
                                
                                <form onSubmit={handleSaveManualConfig} className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-brand-text-muted uppercase">Supabase URL</label>
                                        <input 
                                            value={manualUrl}
                                            onChange={(e) => setManualUrl(e.target.value)}
                                            placeholder="https://xyz.supabase.co"
                                            className="w-full bg-brand-charcoal border border-brand-slate rounded-lg py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-brand-text-muted uppercase">Anon Key</label>
                                        <input 
                                            value={manualKey}
                                            onChange={(e) => setManualKey(e.target.value)}
                                            placeholder="eyJhbGciOiJIUzI1..."
                                            className="w-full bg-brand-charcoal border border-brand-slate rounded-lg py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full bg-brand-amber text-brand-charcoal font-black py-2.5 rounded-lg text-xs uppercase hover:bg-white transition-colors"
                                    >
                                        Ativar Sistema
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
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
                                <label className="text-[10px] font-black text-brand-text-muted uppercase ml-1">E-mail</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-brand-text-muted" />
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2.5 pl-10 pr-3 text-brand-text outline-none focus:border-brand-amber transition-all" 
                                        placeholder="seu@email.com"
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-brand-text-muted uppercase ml-1">Senha</label>
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
                                disabled={loading} 
                                className="w-full bg-brand-amber hover:bg-white text-brand-charcoal font-black py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg uppercase text-sm tracking-wider"
                            >
                                {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
                            </button>

                            <div className="flex flex-col gap-2 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsSignUp(!isSignUp)} 
                                    className="text-brand-text-muted text-[10px] font-bold uppercase tracking-widest hover:text-brand-amber"
                                >
                                    {isSignUp ? 'Já tenho conta' : 'Primeiro acesso? Cadastrar'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowManualConfig(true)} 
                                    className="text-brand-text-muted/40 text-[9px] hover:text-brand-amber"
                                >
                                    Reconfigurar conexão
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
