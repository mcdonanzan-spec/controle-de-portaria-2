
import React, { useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase.ts';
import { BuildingIcon, LockClosedIcon, UserIcon } from './icons.tsx';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isConfigured) {
            setMessage({ text: 'Configuração incompleta.', type: 'error' });
            return;
        }
        
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;

                if (data.user) {
                    await supabase.from('perfis').insert([{
                        id: data.user.id,
                        nome_completo: email.split('@')[0].toUpperCase(),
                        cargo: 'porteiro'
                    }]);
                }

                setMessage({ text: 'Cadastro realizado! Verifique seu e-mail.', type: 'success' });
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                if (data.user) {
                    const { data: profile } = await supabase.from('perfis').select('id').eq('id', data.user.id).single();
                    if (!profile) {
                        await supabase.from('perfis').insert([{
                            id: data.user.id,
                            nome_completo: email.split('@')[0].toUpperCase(),
                            cargo: 'porteiro'
                        }]);
                    }
                }
            }
        } catch (error: any) {
            setMessage({ text: error.message || 'Erro inesperado', type: 'error' });
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
                    <p className="text-[10px] text-brand-charcoal/70 font-bold uppercase tracking-widest">Gestão de Acesso Multi-Obras</p>
                </div>
                
                <div className="p-8">
                    <form onSubmit={handleAuth} className="space-y-5">
                        {message && (
                            <div className={`p-4 rounded-xl text-[10px] font-bold border ${
                                message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                                'bg-green-500/10 text-green-400 border-green-500/30'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-brand-text-muted uppercase ml-1">E-mail</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-brand-text-muted" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-3 pl-10 pr-3 text-brand-text outline-none focus:border-brand-amber transition-all text-xs" placeholder="seu-email@dominio.com" required />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-brand-text-muted uppercase ml-1">Senha</label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3 top-3.5 h-4 w-4 text-brand-text-muted" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-3 pl-10 pr-3 text-brand-text outline-none focus:border-brand-amber transition-all text-xs" placeholder="••••••••" required />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-brand-amber text-brand-charcoal font-black py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg uppercase text-xs tracking-widest disabled:opacity-50">
                            {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar no Sistema')}
                        </button>

                        <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-brand-text-muted text-[9px] font-bold uppercase tracking-widest hover:text-brand-amber transition-colors">
                            {isSignUp ? 'Já tenho conta' : 'Novo por aqui? Cadastre-se'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Auth;
