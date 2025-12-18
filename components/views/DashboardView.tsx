
import React, { useMemo } from 'react';
import { Visitor, Delivery } from '../../types';
import { UserIcon, TruckIcon, ExitIcon } from '../icons';

interface DashboardViewProps {
    visitors: Visitor[];
    deliveries: Delivery[];
    onMarkExitRequest: (type: 'visitor' | 'delivery', id: number) => void;
    onNavigateToReports: (type: 'visitors' | 'deliveries') => void;
}

const StatCard: React.FC<{ 
    title: string; 
    weekTotal: number;
    todayTotal: number;
    active: number;
    icon: React.ReactNode;
    colorClass: string;
    onClick: () => void;
}> = ({ title, weekTotal, todayTotal, active, icon, colorClass, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-brand-lead p-6 rounded-3xl shadow-lg border border-brand-steel cursor-pointer hover:bg-brand-slate/20 transition-all hover:scale-[1.01] active:scale-[0.99] group relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass} rounded-full`}></div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-brand-text-muted text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-brand-text transition-colors">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-white">{weekTotal}</p>
                    <span className="text-[10px] font-black text-brand-text-muted uppercase">na semana</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                    <div className="bg-brand-charcoal px-3 py-1.5 rounded-xl border border-brand-steel">
                        <p className="text-[8px] font-black text-brand-text-muted uppercase leading-none">Hoje</p>
                        <p className="text-sm font-black text-white">{todayTotal}</p>
                    </div>
                    <div className="bg-brand-charcoal px-3 py-1.5 rounded-xl border border-brand-steel">
                        <p className="text-[8px] font-black text-feedback-success uppercase leading-none">Ativos</p>
                        <p className="text-sm font-black text-feedback-success">{active}</p>
                    </div>
                </div>
            </div>
            <div className={`p-4 rounded-2xl shadow-inner transition-all group-hover:rotate-12 ${colorClass} text-brand-charcoal`}>
                {icon}
            </div>
        </div>
    </div>
);

const QuickListItem: React.FC<{ 
    primary: string; 
    secondary: string; 
    tertiary: string; 
    onClick: () => void;
    onExitClick: (e: React.MouseEvent) => void;
}> = ({ primary, secondary, tertiary, onClick, onExitClick }) => (
    <div 
        onClick={onClick}
        className="bg-brand-steel p-3 rounded-xl flex justify-between items-center group relative overflow-hidden cursor-pointer hover:bg-brand-slate transition-all border border-transparent hover:border-brand-slate"
    >
        <div className="flex-grow">
            <p className="font-black text-white text-xs uppercase tracking-tight">{primary}</p>
            <p className="text-[10px] text-brand-text-muted font-bold uppercase">{secondary}</p>
        </div>
        <div className="flex items-center">
            <span className="font-mono bg-brand-charcoal text-brand-amber px-2 py-1 rounded-lg text-[10px] font-bold transition-transform duration-200 ease-in-out transform group-hover:-translate-x-12">{tertiary}</span>
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onExitClick(e);
                }}
                className="absolute right-0 h-full w-12 bg-feedback-error text-brand-charcoal flex items-center justify-center transition-transform duration-200 ease-in-out transform translate-x-12 group-hover:translate-x-0 shadow-[-10px_0_15px_rgba(0,0,0,0.2)]"
                title="Registrar Saída Rápida"
            >
                <ExitIcon className="h-5 w-5" />
            </button>
        </div>
    </div>
);

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
};

const isLast7Days = (date: Date) => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return date >= sevenDaysAgo && date <= today;
};

const DashboardView: React.FC<DashboardViewProps> = ({ visitors, deliveries, onMarkExitRequest, onNavigateToReports }) => {

    const stats = useMemo(() => {
        const vToday = visitors.filter(v => isToday(v.entryTime));
        const vWeek = visitors.filter(v => isLast7Days(v.entryTime));
        const vActive = visitors.filter(v => !v.exitTime);

        const dToday = deliveries.filter(d => isToday(d.entryTime));
        const dWeek = deliveries.filter(d => isLast7Days(d.entryTime));
        const dActive = deliveries.filter(d => !d.exitTime);

        return {
            vToday: vToday.length,
            vWeek: vWeek.length,
            vActive: vActive.length,
            dToday: dToday.length,
            dWeek: dWeek.length,
            dActive: dActive.length,
            allActiveV: vActive,
            allActiveD: dActive
        };
    }, [visitors, deliveries]);

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Fluxo de Visitantes" 
                    weekTotal={stats.vWeek}
                    todayTotal={stats.vToday}
                    active={stats.vActive}
                    icon={<UserIcon className="h-8 w-8"/>} 
                    colorClass="bg-brand-amber"
                    onClick={() => onNavigateToReports('visitors')}
                />
                <StatCard 
                    title="Entregas Recebidas" 
                    weekTotal={stats.dWeek}
                    todayTotal={stats.dToday}
                    active={stats.dActive}
                    icon={<TruckIcon className="h-8 w-8"/>} 
                    colorClass="bg-brand-blue"
                    onClick={() => onNavigateToReports('deliveries')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-brand-lead p-6 rounded-3xl border border-brand-steel shadow-2xl">
                    <header className="flex justify-between items-center mb-6">
                        <h2 className="text-xs font-black text-brand-amber flex items-center uppercase tracking-widest">
                          <UserIcon className="h-5 w-5 mr-3"/> Visitantes no Canteiro
                        </h2>
                        <span className="bg-brand-charcoal px-3 py-1 rounded-full text-[9px] font-black border border-brand-steel text-brand-text-muted">
                            {stats.allActiveV.length} NO MOMENTO
                        </span>
                    </header>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {stats.allActiveV.length > 0 ? (
                            stats.allActiveV.map(v => (
                                <QuickListItem 
                                    key={v.id} 
                                    primary={v.name} 
                                    secondary={v.company}
                                    tertiary={v.vehicle.plate || 'A PÉ'}
                                    onClick={() => onNavigateToReports('visitors')}
                                    onExitClick={() => onMarkExitRequest('visitor', v.id)}
                                />
                            ))
                        ) : (
                            <div className="py-12 text-center opacity-30">
                                <UserIcon className="h-12 w-12 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Canteiro Vazio</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-brand-lead p-6 rounded-3xl border border-brand-steel shadow-2xl">
                    <header className="flex justify-between items-center mb-6">
                        <h2 className="text-xs font-black text-brand-blue flex items-center uppercase tracking-widest">
                          <TruckIcon className="h-5 w-5 mr-3"/> Descargas em Curso
                        </h2>
                        <span className="bg-brand-charcoal px-3 py-1 rounded-full text-[9px] font-black border border-brand-steel text-brand-text-muted">
                            {stats.allActiveD.length} NO MOMENTO
                        </span>
                    </header>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                         {stats.allActiveD.length > 0 ? (
                            stats.allActiveD.map(d => (
                                <QuickListItem 
                                    key={d.id} 
                                    primary={d.driverName} 
                                    secondary={d.supplier}
                                    tertiary={d.licensePlate}
                                    onClick={() => onNavigateToReports('deliveries')}
                                    onExitClick={() => onMarkExitRequest('delivery', d.id)}
                                />
                            ))
                        ) : (
                            <div className="py-12 text-center opacity-30">
                                <TruckIcon className="h-12 w-12 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma entrega ativa</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
