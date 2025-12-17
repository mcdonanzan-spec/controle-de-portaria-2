import React, { useMemo } from 'react';
import { Visitor, Delivery } from '../../types';
import { UserIcon, TruckIcon, ExitIcon } from '../icons';

interface DashboardViewProps {
    visitors: Visitor[];
    deliveries: Delivery[];
    onMarkExitRequest: (type: 'visitor' | 'delivery', id: number, name: string) => void;
}

const StatCard: React.FC<{ 
    title: string; 
    total: number; 
    active: number;
    exits: number;
    icon: React.ReactNode 
}> = ({ title, total, active, exits, icon }) => (
    <div className="bg-brand-lead p-6 rounded-lg shadow-lg flex items-center justify-between border border-brand-steel">
        <div>
            <p className="text-brand-text-muted text-lg">{title}</p>
            <p className="text-5xl font-bold text-white">{total}</p>
            <p className="text-md text-brand-text-muted mt-1">
                <span className="font-semibold text-feedback-success">{active} Ativos</span>
                <span className="mx-2">•</span>
                <span className="text-brand-text">{exits} Saídas</span>
            </p>
        </div>
        <div className="text-brand-amber">
            {icon}
        </div>
    </div>
);

const QuickListItem: React.FC<{ 
    primary: string; 
    secondary: string; 
    tertiary: string; 
    onExitClick: () => void;
}> = ({ primary, secondary, tertiary, onExitClick }) => (
    <div className="bg-brand-steel p-3 rounded-md flex justify-between items-center group relative overflow-hidden">
        <div>
            <p className="font-semibold text-white">{primary}</p>
            <p className="text-sm text-brand-text-muted">{secondary}</p>
        </div>
        <div className="flex items-center">
            <span className="font-mono bg-brand-charcoal text-brand-amber px-2 py-1 rounded text-sm transition-transform duration-200 ease-in-out transform group-hover:-translate-x-12">{tertiary}</span>
             <button 
                onClick={onExitClick}
                className="absolute right-0 h-full w-12 bg-feedback-error text-white flex items-center justify-center transition-transform duration-200 ease-in-out transform translate-x-12 group-hover:translate-x-0"
                aria-label={`Registrar saída de ${primary}`}
            >
                <ExitIcon className="h-5 w-5" />
            </button>
        </div>
    </div>
);

const EmptyList: React.FC<{ message: string, icon: React.ReactNode}> = ({message, icon}) => (
    <div className="flex flex-col items-center justify-center h-48 text-center text-brand-text-muted">
        {icon}
        <p className="mt-4">{message}</p>
    </div>
);

const isToday = (someDate: Date) => {
    if (!someDate || !(someDate instanceof Date) || isNaN(someDate.getTime())) return false;
    const today = new Date();
    return someDate.getFullYear() === today.getFullYear() &&
           someDate.getMonth() === today.getMonth() &&
           someDate.getDate() === today.getDate();
};

const DashboardView: React.FC<DashboardViewProps> = ({ visitors, deliveries, onMarkExitRequest }) => {

    const { todayVisitors, allActiveVisitors } = useMemo(() => {
        const today: Visitor[] = [];
        const active: Visitor[] = [];
        for (const v of visitors) {
            if (isToday(v.entryTime)) {
                today.push(v);
            }
            if (!v.exitTime) {
                active.push(v);
            }
        }
        return { todayVisitors: today, allActiveVisitors: active };
    }, [visitors]);

    const { todayDeliveries, allActiveDeliveries } = useMemo(() => {
        const today: Delivery[] = [];
        const active: Delivery[] = [];
        for (const d of deliveries) {
            if (isToday(d.entryTime)) {
                today.push(d);
            }
            if (!d.exitTime) {
                active.push(d);
            }
        }
        return { todayDeliveries: today, allActiveDeliveries: active };
    }, [deliveries]);

    const activeVisitorsTodayCount = useMemo(() => todayVisitors.filter(v => !v.exitTime).length, [todayVisitors]);
    const activeDeliveriesTodayCount = useMemo(() => todayDeliveries.filter(d => !d.exitTime).length, [todayDeliveries]);
    
    const exitedVisitorsTodayCount = todayVisitors.length - activeVisitorsTodayCount;
    const exitedDeliveriesTodayCount = todayDeliveries.length - activeDeliveriesTodayCount;

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Visitantes Hoje" 
                    total={todayVisitors.length} 
                    active={activeVisitorsTodayCount}
                    exits={exitedVisitorsTodayCount}
                    icon={<UserIcon className="h-12 w-12"/>} 
                />
                <StatCard 
                    title="Entregas Hoje" 
                    total={todayDeliveries.length}
                    active={activeDeliveriesTodayCount}
                    exits={exitedDeliveriesTodayCount}
                    icon={<TruckIcon className="h-12 w-12"/>} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Visitors List */}
                <div className="bg-brand-lead p-4 rounded-lg border border-brand-steel">
                    <h2 className="text-xl font-bold mb-4 text-brand-amber flex items-center"><UserIcon className="h-6 w-6 mr-2"/> Visitantes Ativos na Obra</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {allActiveVisitors.length > 0 ? (
                            allActiveVisitors.map(v => (
                                <QuickListItem 
                                    key={v.id} 
                                    primary={v.name} 
                                    secondary={v.company}
                                    tertiary={v.vehicle.plate || 'S/ VEÍCULO'}
                                    onExitClick={() => onMarkExitRequest('visitor', v.id, v.name)}
                                />
                            ))
                        ) : (
                            <EmptyList message="Nenhum visitante na obra." icon={<UserIcon className="w-12 h-12"/>} />
                        )}
                    </div>
                </div>

                {/* Active Deliveries List */}
                <div className="bg-brand-lead p-4 rounded-lg border border-brand-steel">
                    <h2 className="text-xl font-bold mb-4 text-brand-amber flex items-center"><TruckIcon className="h-6 w-6 mr-2"/> Entregas Ativas na Obra</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                         {allActiveDeliveries.length > 0 ? (
                            allActiveDeliveries.map(d => (
                                <QuickListItem 
                                    key={d.id} 
                                    primary={d.driverName} 
                                    secondary={d.supplier}
                                    tertiary={d.licensePlate}
                                    onExitClick={() => onMarkExitRequest('delivery', d.id, d.driverName)}
                                />
                            ))
                        ) : (
                            <EmptyList message="Nenhuma entrega na obra." icon={<TruckIcon className="w-12 h-12"/>} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
