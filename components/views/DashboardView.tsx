
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
    total: number; 
    active: number;
    exits: number;
    icon: React.ReactNode;
    onClick: () => void;
}> = ({ title, total, active, exits, icon, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-brand-lead p-6 rounded-lg shadow-lg flex items-center justify-between border border-brand-steel cursor-pointer hover:bg-brand-slate/30 transition-all hover:scale-[1.02] active:scale-[0.98] group"
    >
        <div>
            <p className="text-brand-text-muted text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-brand-amber transition-colors">{title}</p>
            <p className="text-5xl font-black text-white">{total}</p>
            <p className="text-[10px] text-brand-text-muted mt-2 flex items-center gap-2 font-bold uppercase">
                <span className="text-feedback-success">{active} Ativos</span>
                <span className="w-1 h-1 bg-brand-slate rounded-full"></span>
                <span>{exits} Saídas</span>
            </p>
        </div>
        <div className="text-brand-amber bg-brand-charcoal p-4 rounded-2xl shadow-inner group-hover:rotate-12 transition-transform">
            {icon}
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
                className="absolute right-0 h-full w-12 bg-feedback-error text-brand-charcoal flex items-center justify-center transition-transform duration-200 ease-in-out transform translate-x-12 group-hover:translate-x-0"
                title="Registrar Saída Rápida"
            >
                <ExitIcon className="h-5 w-5" />
            </button>
        </div>
    </div>
);

const EmptyList: React.FC<{ message: string, icon: React.ReactNode}> = ({message, icon}) => (
    <div className="flex flex-col items-center justify-center h-48 text-center text-brand-text-muted opacity-40">
        {icon}
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest">{message}</p>
    </div>
);

const isToday = (someDate: Date) => {
    if (!someDate || !(someDate instanceof Date) || isNaN(someDate.getTime())) return false;
    const today = new Date();
    return someDate.getFullYear() === today.getFullYear() &&
           someDate.getMonth() === today.getMonth() &&
           someDate.getDate() === today.getDate();
};

const DashboardView: React.FC<DashboardViewProps> = ({ visitors, deliveries, onMarkExitRequest, onNavigateToReports }) => {

    const { todayVisitors, allActiveVisitors } = useMemo(() => {
        const today: Visitor[] = [];
        const active: Visitor[] = [];
        for (const v of visitors) {
            if (isToday(v.entryTime)) today.push(v);
            if (!v.exitTime) active.push(v);
        }
        return { todayVisitors: today, allActiveVisitors: active };
    }, [visitors]);

    const { todayDeliveries, allActiveDeliveries } = useMemo(() => {
        const today: Delivery[] = [];
        const active: Delivery[] = [];
        for (const d of deliveries) {
            if (isToday(d.entryTime)) today.push(d);
            if (!d.exitTime) active.push(d);
        }
        return { todayDeliveries: today, allActiveDeliveries: active };
    }, [deliveries]);

    const activeVisitorsTodayCount = useMemo(() => todayVisitors.filter(v => !v.exitTime).length, [todayVisitors]);
    const activeDeliveriesTodayCount = useMemo(() => todayDeliveries.filter(d => !d.exitTime).length, [todayDeliveries]);
    
    const exitedVisitorsTodayCount = todayVisitors.length - activeVisitorsTodayCount;
    const exitedDeliveriesTodayCount = todayDeliveries.length - activeDeliveriesTodayCount;

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Visitantes Hoje" 
                    total={todayVisitors.length} 
                    active={activeVisitorsTodayCount}
                    exits={exitedVisitorsTodayCount}
                    icon={<UserIcon className="h-10 w-10"/>} 
                    onClick={() => onNavigateToReports('visitors')}
                />
                <StatCard 
                    title="Entregas Hoje" 
                    total={todayDeliveries.length}
                    active={activeDeliveriesTodayCount}
                    exits={exitedDeliveriesTodayCount}
                    icon={<TruckIcon className="h-10 w-10"/>} 
                    onClick={() => onNavigateToReports('deliveries')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Visitors List */}
                <div className="bg-brand-lead p-6 rounded-2xl border border-brand-steel shadow-2xl">
                    <h2 className="text-xs font-black mb-6 text-brand-amber flex items-center uppercase tracking-widest">
                      <UserIcon className="h-5 w-5 mr-3"/> 
                      Visitantes Ativos
                      <span className="ml-auto bg-brand-charcoal px-2 py-0.5 rounded text-[9px] border border-brand-steel">{allActiveVisitors.length}</span>
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {allActiveVisitors.length > 0 ? (
                            allActiveVisitors.map(v => (
                                <QuickListItem 
                                    key={v.id} 
                                    primary={v.name} 
                                    secondary={v.company}
                                    tertiary={v.vehicle.plate || 'S/ VEÍCULO'}
                                    onClick={() => onNavigateToReports('visitors')}
                                    onExitClick={() => onMarkExitRequest('visitor', v.id)}
                                />
                            ))
                        ) : (
                            <EmptyList message="Sem visitantes no momento" icon={<UserIcon className="w-12 h-12"/>} />
                        )}
                    </div>
                </div>

                {/* Active Deliveries List */}
                <div className="bg-brand-lead p-6 rounded-2xl border border-brand-steel shadow-2xl">
                    <h2 className="text-xs font-black mb-6 text-brand-amber flex items-center uppercase tracking-widest">
                      <TruckIcon className="h-5 w-5 mr-3"/> 
                      Entregas em Curso
                      <span className="ml-auto bg-brand-charcoal px-2 py-0.5 rounded text-[9px] border border-brand-steel">{allActiveDeliveries.length}</span>
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                         {allActiveDeliveries.length > 0 ? (
                            allActiveDeliveries.map(d => (
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
                            <EmptyList message="Sem entregas no momento" icon={<TruckIcon className="w-12 h-12"/>} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
