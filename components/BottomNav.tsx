import React from 'react';
import { TruckIcon, UserIcon, ExitIcon, ReportsIcon, DashboardIcon } from './icons';

type Tab = 'Painel' | 'Entregas' | 'Visitantes' | 'Saida' | 'Relatorios';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavButton: React.FC<{
  label: Tab;
  activeTab: Tab;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, activeTab, onClick, icon }) => {
  const isActive = activeTab === label;
  const activeClass = 'text-brand-amber border-t-2 border-brand-amber';
  const inactiveClass = 'text-brand-text-muted hover:text-brand-text';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const iconClass = "h-6 w-6 mb-1";
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-brand-lead shadow-top flex justify-around border-t border-brand-steel z-10">
      <NavButton label="Painel" activeTab={activeTab} onClick={() => setActiveTab('Painel')} icon={<DashboardIcon className={iconClass} />} />
      <NavButton label="Entregas" activeTab={activeTab} onClick={() => setActiveTab('Entregas')} icon={<TruckIcon className={iconClass} />} />
      <NavButton label="Visitantes" activeTab={activeTab} onClick={() => setActiveTab('Visitantes')} icon={<UserIcon className={iconClass} />} />
      <NavButton label="Saida" activeTab={activeTab} onClick={() => setActiveTab('Saida')} icon={<ExitIcon className={iconClass} />} />
      <NavButton label="Relatorios" activeTab={activeTab} onClick={() => setActiveTab('Relatorios')} icon={<ReportsIcon className={iconClass} />} />
    </footer>
  );
};

export default BottomNav;