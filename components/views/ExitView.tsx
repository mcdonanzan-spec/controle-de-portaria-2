import React, { useState, useMemo } from 'react';
import { Visitor, Delivery } from '../../types';
import FormWrapper from '../FormWrapper';
import { ExitIcon, SearchIcon } from '../icons';

interface ExitViewProps {
    visitors: Visitor[];
    deliveries: Delivery[];
    onMarkExitRequest: (type: 'visitor' | 'delivery', id: number, name: string) => void;
}

const ExitView: React.FC<ExitViewProps> = ({ visitors, deliveries, onMarkExitRequest }) => {
    const [recordType, setRecordType] = useState<'deliveries' | 'visitors' | ''>('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const activeVisitors = useMemo(() => visitors.filter(v => !v.exitTime), [visitors]);
    const activeDeliveries = useMemo(() => deliveries.filter(d => !d.exitTime), [deliveries]);

    const filteredList = useMemo(() => {
        if (!recordType) return [];
        
        const list = recordType === 'visitors' ? activeVisitors : activeDeliveries;
        if (!searchTerm) return list;

        return list.filter(item => {
            const lowerSearch = searchTerm.toLowerCase();
            if (recordType === 'visitors') {
                const v = item as Visitor;
                return v.name.toLowerCase().includes(lowerSearch) || v.document.toLowerCase().includes(lowerSearch) || v.company.toLowerCase().includes(lowerSearch);
            } else {
                const d = item as Delivery;
                return d.supplier.toLowerCase().includes(lowerSearch) || d.driverName.toLowerCase().includes(lowerSearch) || d.licensePlate.toLowerCase().includes(lowerSearch);
            }
        });
    }, [recordType, searchTerm, activeVisitors, activeDeliveries]);

    const handleRegisterExit = () => {
        if (selectedId && recordType) {
            let name = '';
            if (recordType === 'visitors') {
                const visitor = activeVisitors.find(v => v.id === selectedId);
                name = visitor?.name || 'Visitante';
            } else {
                const delivery = activeDeliveries.find(d => d.id === selectedId);
                name = delivery?.driverName || 'Motorista';
            }
            onMarkExitRequest(recordType === 'visitors' ? 'visitor' : 'delivery', selectedId, name);
            setSelectedId(null);
            setSearchTerm('');
        }
    };
    
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRecordType(e.target.value as 'deliveries' | 'visitors' | '');
        setSelectedId(null);
        setSearchTerm('');
    }

    const renderList = () => {
        if (!recordType) {
            return <p className="text-center text-brand-text-muted mt-4">Selecione um tipo de registro para ver a lista.</p>;
        }

        if (filteredList.length === 0) {
            return <p className="text-center text-brand-text-muted mt-4">Nenhum registro ativo encontrado{searchTerm && ' para "' + searchTerm + '"'}.</p>;
        }

        return (
            <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2">
                {filteredList.map(item => (
                    <div key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedId === item.id ? 'bg-brand-blue border-brand-amber' : 'bg-brand-steel border-transparent hover:border-brand-slate'}`}
                    >
                        {recordType === 'visitors' && (
                            <p className="font-semibold text-white">{(item as Visitor).name} - Doc: {(item as Visitor).document}</p>
                        )}
                        {recordType === 'deliveries' && (
                             <p className="font-semibold text-white">{(item as Delivery).supplier} - Placa: {(item as Delivery).licensePlate}</p>
                        )}
                        <p className="text-sm text-brand-text-muted">Entrada: {item.entryTime.toLocaleString('pt-BR')}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <FormWrapper title="Registrar Saída" icon={<ExitIcon className="h-7 w-7" />} colorClass="bg-[#D35400]">
            <div className="space-y-4">
                 <div>
                    <label className="block text-brand-text text-sm font-bold mb-2">Tipo de Registro</label>
                    <select 
                        value={recordType}
                        onChange={handleTypeChange}
                        className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text"
                    >
                        <option value="">Selecione...</option>
                        <option value="deliveries">Entregas</option>
                        <option value="visitors">Visitantes</option>
                    </select>
                </div>
                {recordType && (
                    <div className="relative">
                         <label className="block text-brand-text text-sm font-bold mb-2">Buscar</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nome, placa, empresa..."
                            className="w-full bg-brand-steel border-brand-slate border rounded py-2 pl-10 pr-3 text-brand-text"
                        />
                        <SearchIcon className="absolute left-3 top-9 h-5 w-5 text-brand-text-muted" />
                    </div>
                )}
            </div>
            
            {renderList()}
            
            <button
                onClick={handleRegisterExit}
                disabled={!selectedId}
                className="w-full mt-6 bg-feedback-error hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded transition-colors disabled:bg-brand-slate disabled:cursor-not-allowed flex items-center justify-center"
            >
                <ExitIcon className="h-6 w-6 mr-2"/>
                Registrar Saída
            </button>
        </FormWrapper>
    );
};

export default ExitView;
