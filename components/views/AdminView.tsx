
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Work, UserProfile } from '../../types';
import FormWrapper from '../FormWrapper';
import { BuildingIcon, UserIcon, CheckCircleIcon, XCircleIcon, LockClosedIcon } from '../icons';

interface AdminViewProps {
  onRefresh: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onRefresh }) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para nova obra
  const [newWorkName, setNewWorkName] = useState('');
  const [newWorkAddress, setNewWorkAddress] = useState('');

  const loadData = async () => {
    setLoading(true);
    const { data: worksData } = await supabase.from('obras').select('*').order('nome');
    const { data: profilesData } = await supabase.from('perfis').select('*, obras(nome)');
    
    if (worksData) setWorks(worksData.map(w => ({ id: w.id, name: w.nome, address: w.endereco, active: w.ativo })));
    if (profilesData) setUsers(profilesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkName) return;

    const { error } = await supabase.from('obras').insert([{ nome: newWorkName.toUpperCase(), endereco: newWorkAddress.toUpperCase() }]);
    if (!error) {
      setNewWorkName('');
      setNewWorkAddress('');
      loadData();
      onRefresh();
    }
  };

  const updateUserRole = async (userId: string, role: string, workId: number | null) => {
    const { error } = await supabase
      .from('perfis')
      .update({ cargo: role, obra_id: workId, atualizado_em: new Date() })
      .eq('id', userId);

    if (!error) loadData();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Gestão de Obras */}
      <FormWrapper title="Nova Obra" icon={<BuildingIcon className="h-6 w-6" />} colorClass="bg-brand-amber">
        <form onSubmit={handleAddWork} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1">Nome da Obra</label>
              <input 
                value={newWorkName} 
                onChange={e => setNewWorkName(e.target.value)} 
                className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text text-xs font-bold outline-none focus:border-brand-amber transition-all" 
                placeholder="EX: RESIDENCIAL SOLAR"
              />
            </div>
            <div>
              <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1">Endereço / Local</label>
              <input 
                value={newWorkAddress} 
                onChange={e => setNewWorkAddress(e.target.value)} 
                className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text text-xs font-bold outline-none focus:border-brand-amber transition-all" 
                placeholder="EX: SETOR OESTE, GOIÂNIA"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-feedback-success text-brand-charcoal font-black py-3 rounded-xl uppercase text-[10px] tracking-widest shadow-lg">
            Cadastrar Unidade
          </button>
        </form>
      </FormWrapper>

      {/* Lista de Obras Ativas */}
      <div className="bg-brand-lead p-6 rounded-2xl border border-brand-steel shadow-xl">
        <h2 className="text-xs font-black mb-6 text-brand-amber flex items-center uppercase tracking-widest">
          <BuildingIcon className="h-5 w-5 mr-3"/> Unidades de Obra
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {works.map(work => (
            <div key={work.id} className="bg-brand-steel p-4 rounded-xl border border-brand-slate">
              <p className="font-black text-white text-xs uppercase">{work.name}</p>
              <p className="text-[9px] text-brand-text-muted font-bold uppercase mt-1">{work.address}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[8px] bg-brand-charcoal px-2 py-0.5 rounded text-feedback-success font-black border border-feedback-success/20">ID: {work.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gestão de Permissões */}
      <div className="bg-brand-lead p-6 rounded-2xl border border-brand-steel shadow-xl">
        <h2 className="text-xs font-black mb-6 text-brand-amber flex items-center uppercase tracking-widest">
          <LockClosedIcon className="h-5 w-5 mr-3"/> Controle de Acesso e Equipe
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] text-brand-text-muted font-black uppercase border-b border-brand-steel">
                <th className="pb-3 px-2">Colaborador</th>
                <th className="pb-3 px-2">Cargo</th>
                <th className="pb-3 px-2">Alocação (Obra)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-steel">
              {users.map(user => (
                <tr key={user.id} className="text-xs">
                  <td className="py-4 px-2">
                    <p className="font-black text-brand-text uppercase">{user.nome_completo || 'Sem Nome'}</p>
                    <p className="text-[9px] text-brand-text-muted">{user.id.slice(0,8)}...</p>
                  </td>
                  <td className="py-4 px-2">
                    <select 
                      value={user.cargo} 
                      onChange={e => updateUserRole(user.id, e.target.value, user.obra_id)}
                      className="bg-brand-steel border border-brand-slate rounded px-2 py-1 text-[10px] font-bold text-brand-text outline-none uppercase"
                    >
                      <option value="porteiro">Porteiro</option>
                      <option value="gestor">Gestor / Adm</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <select 
                      value={user.obra_id || ''} 
                      onChange={e => updateUserRole(user.id, user.cargo, e.target.value ? parseInt(e.target.value) : null)}
                      className="bg-brand-steel border border-brand-slate rounded px-2 py-1 text-[10px] font-bold text-brand-text outline-none uppercase"
                    >
                      <option value="">Nenhuma</option>
                      {works.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
