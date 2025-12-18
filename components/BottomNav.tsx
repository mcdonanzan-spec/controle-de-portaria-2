
import React from 'react';
import { TruckIcon, UserIcon, ExitIcon, ReportsIcon, DashboardIcon, LockClosedIcon } from './icons';
import { UserRole } from '../types';

type Tab = 'Painel' | 'Entregas' | 'Visitantes' | 'Saida' | 'Relatorios' | 'Gestao';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  userRole: UserRole;
}

const NavButton: React.FC<{
  label: Tab;
  activeTab: Tab;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, activeTab, onClick, icon }) => {
  const isActive = activeTab === label;
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-all ${isActive ? 'text-brand-amber border-t-2 border-brand-amber bg-brand-amber/5' : 'text-brand-text-muted hover:text-brand-text'}`}>
      <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>{icon}</div>
      <span className="text-[8px] font-black uppercase tracking-tighter mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, userRole }) => {
  const iconClass = "h-5 w-5";
  const isAdmin = userRole === 'admin' || userRole === 'administrador';
  const canOperate = isAdmin || userRole === 'porteiro';
  const canReport = isAdmin || userRole === 'gestor';

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-brand-lead shadow-top flex justify-around border-t border-brand-steel z-40 backdrop-blur-md bg-opacity-95">
      <NavButton label="Painel" activeTab={activeTab} onClick={() => setActiveTab('Painel')} icon={<DashboardIcon className={iconClass} />} />
      {canOperate && (
        <>
          <NavButton label="Entregas" activeTab={activeTab} onClick={() => setActiveTab('Entregas')} icon={<TruckIcon className={iconClass} />} />
          <NavButton label="Visitantes" activeTab={activeTab} onClick={() => setActiveTab('Visitantes')} icon={<UserIcon className={iconClass} />} />
          <NavButton label="Saida" activeTab={activeTab} onClick={() => setActiveTab('Saida')} icon={<ExitIcon className={iconClass} />} />
        </>
      )}
      {canReport && <NavButton label="Relatorios" activeTab={activeTab} onClick={() => setActiveTab('Relatorios')} icon={<ReportsIcon className={iconClass} />} />}
      {isAdmin && <NavButton label="Gestao" activeTab={activeTab} onClick={() => setActiveTab('Gestao')} icon={<LockClosedIcon className={iconClass} />} />}
    </footer>
  );
};

export default BottomNav;
