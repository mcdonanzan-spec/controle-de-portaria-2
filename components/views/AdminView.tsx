
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Work } from '../../types';
import FormWrapper from '../FormWrapper';
import { BuildingIcon, LockClosedIcon, SearchIcon } from '../icons';

interface AdminViewProps {
  onRefresh: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onRefresh }) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newWorkName, setNewWorkName] = useState('');
  const [newWorkAddress, setNewWorkAddress] = useState('');

  const loadData = async () => {
    const { data: worksData } = await supabase.from('obras').select('*').order('nome');
    const { data: profilesData } = await supabase.from('perfis').select('*');
    if (worksData) setWorks(worksData.map(w => ({ id: w.id, name: w.nome, address: w.endereco, active: w.ativo })));
    if (profilesData) setUsers(profilesData);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkName) return;
    const { error } = await supabase.from('obras').insert([{ nome: newWorkName.toUpperCase(), endereco: newWorkAddress.toUpperCase() }]);
    if (!error) {
      setNewWorkName(''); setNewWorkAddress('');
      loadData(); onRefresh();
    }
  };

  const updateUserRole = async (userId: string, role: string, workId: number | null) => {
    const { error } = await supabase.from('perfis').update({ cargo: role, obra_id: workId, atualizado_em: new Date() }).eq('id', userId);
    if (!error) { loadData(); onRefresh(); }
  };

  const filteredUsers = users.filter(u => u.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
            <FormWrapper title="Nova Unidade" icon={<BuildingIcon className="h-6 w-6" />} colorClass="bg-brand-amber">
                <form onSubmit={handleAddWork} className="space-y-4">
                    <input value={newWorkName} onChange={e => setNewWorkName(e.target.value)} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber" placeholder="NOME DA OBRA" />
                    <input value={newWorkAddress} onChange={e => setNewWorkAddress(e.target.value)} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber" placeholder="CIDADE / LOCAL" />
                    <button type="submit" className="w-full bg-feedback-success text-brand-charcoal font-black py-3 rounded-xl uppercase text-[10px] tracking-widest shadow-lg">Ativar Obra</button>
                </form>
            </FormWrapper>
            <div className="bg-brand-lead p-6 rounded-2xl border border-brand-steel shadow-xl">
                <h2 className="text-xs font-black mb-4 text-brand-amber uppercase tracking-widest">Obras Ativas ({works.length})</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {works.map(w => (
                        <div key={w.id} className="bg-brand-steel p-3 rounded-xl border border-brand-slate flex justify-between items-center">
                            <div><p className="font-black text-white text-[9px] uppercase">{w.name}</p><p className="text-[7px] text-brand-text-muted uppercase">{w.address}</p></div>
                            <span className="text-[8px] bg-brand-charcoal px-2 py-1 rounded text-brand-amber font-black">ID {w.id}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="lg:col-span-2 bg-brand-lead p-6 rounded-3xl border border-brand-steel shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-black text-brand-amber uppercase tracking-widest flex items-center"><LockClosedIcon className="mr-2" /> Equipe e Acessos</h2>
                <div className="relative"><input type="text" placeholder="BUSCAR..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-brand-charcoal border border-brand-steel rounded-xl py-2 pl-8 text-[10px] text-brand-text w-40 uppercase" /><SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-brand-text-muted" /></div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-[8px] text-brand-text-muted font-black uppercase border-b border-brand-steel"><tr><th className="pb-4">Usuário</th><th className="pb-4">Cargo</th><th className="pb-4">Obra Alocada</th></tr></thead>
                    <tbody className="divide-y divide-brand-steel/50">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="text-[10px] font-bold">
                                <td className="py-4"><p className="text-brand-text uppercase">{u.nome_completo}</p><p className="text-[7px] text-brand-text-muted">{u.id.slice(0,8)}</p></td>
                                <td className="py-4">
                                    <select value={u.cargo} onChange={e => updateUserRole(u.id, e.target.value, u.obra_id)} className="bg-brand-charcoal border border-brand-steel rounded px-2 py-1 uppercase text-brand-amber">
                                        <option value="porteiro">Porteiro</option><option value="gestor">Gestor / Eng</option><option value="admin">Super ADM</option>
                                    </select>
                                </td>
                                <td className="py-4">
                                    <select value={u.obra_id || ''} onChange={e => updateUserRole(u.id, u.cargo, e.target.value ? parseInt(e.target.value) : null)} className="bg-brand-charcoal border border-brand-steel rounded px-2 py-1 uppercase text-brand-text">
                                        <option value="">Não Alocado</option>
                                        {works.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
