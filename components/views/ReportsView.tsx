
import React, { useState, useMemo, useEffect } from 'react';
import { Visitor, Delivery } from '../../types';
import Modal from '../Modal';
import { exportToCsv } from '../../services/csvExporter';
import { ExportIcon, TruckIcon, UserIcon, SearchIcon, HelmetIcon, BootsIcon, GlassesIcon, CheckCircleIcon, XCircleIcon, ReportsIcon } from '../icons';

interface ReportsViewProps {
    visitors: Visitor[];
    deliveries: Delivery[];
    activeReportType?: 'deliveries' | 'visitors';
    onReportTypeChange?: (type: 'deliveries' | 'visitors') => void;
}

const EmptyState: React.FC = () => (
    <div className="text-center py-20 bg-brand-charcoal/30 rounded-3xl border-2 border-dashed border-brand-steel">
        <ReportsIcon className="mx-auto h-16 w-16 text-brand-slate" />
        <h3 className="mt-4 text-xs font-black text-brand-text uppercase tracking-widest">Nenhum registro no período</h3>
        <p className="mt-2 text-[10px] text-brand-text-muted font-bold uppercase">Ajuste as datas ou a busca acima.</p>
    </div>
);

const EpiStatus: React.FC<{ epi: Visitor['epi'] }> = ({ epi }) => (
    <div className="flex items-center gap-2 mt-4">
        {(Object.keys(epi) as Array<keyof typeof epi>).map(key => {
            const isActive = epi[key];
            const Icon = key === 'helmet' ? HelmetIcon : key === 'boots' ? BootsIcon : GlassesIcon;
            return (isActive || key === 'helmet') ? (
                <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${isActive ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400/50'}`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{key === 'helmet' ? 'CAPACETE' : key === 'boots' ? 'BOTINA' : 'ÓCULOS'}</span>
                </div>
            ) : null;
        })}
    </div>
);


const ReportsView: React.FC<ReportsViewProps> = ({ visitors, deliveries, activeReportType = 'visitors', onReportTypeChange }) => {
    const [reportType, setReportType] = useState<'deliveries' | 'visitors'>(activeReportType);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [photoModalUrl, setPhotoModalUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filtros de Data
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });
    
    useEffect(() => {
        setReportType(activeReportType);
    }, [activeReportType]);

    const handleViewPhoto = (url: string) => {
        if(!url) return;
        setPhotoModalUrl(url);
        setIsPhotoModalOpen(true);
    };

    const handleTypeToggle = (type: 'deliveries' | 'visitors') => {
        setReportType(type);
        setSearchTerm('');
        if (onReportTypeChange) onReportTypeChange(type);
    };

    const filteredData = useMemo(() => {
        const data = reportType === 'visitors' ? visitors : deliveries;
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        return data.filter(item => {
            // Filtro de Data
            const itemDate = new Date(item.entryTime);
            if (itemDate < start || itemDate > end) return false;

            // Filtro de Busca
            if (!searchTerm) return true;
            const lowerSearch = searchTerm.toLowerCase();
            if (reportType === 'visitors') {
                const v = item as Visitor;
                return v.name.toLowerCase().includes(lowerSearch) || 
                       v.document.toLowerCase().includes(lowerSearch) || 
                       v.company.toLowerCase().includes(lowerSearch) ||
                       v.vehicle.plate.toLowerCase().includes(lowerSearch);
            } else {
                const d = item as Delivery;
                return d.supplier.toLowerCase().includes(lowerSearch) || 
                       d.driverName.toLowerCase().includes(lowerSearch) || 
                       d.licensePlate.toLowerCase().includes(lowerSearch);
            }
        });

    }, [reportType, searchTerm, startDate, endDate, visitors, deliveries]);

    // Exportar respeitando o filtro
    const handleExport = () => {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        const vFiltered = visitors.filter(v => {
            const d = new Date(v.entryTime);
            return d >= start && d <= end;
        });
        const dFiltered = deliveries.filter(del => {
            const d = new Date(del.entryTime);
            return d >= start && d <= end;
        });

        exportToCsv(vFiltered, dFiltered);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header e Filtros */}
                <header className="bg-brand-lead p-6 rounded-3xl border border-brand-steel shadow-2xl space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex bg-brand-charcoal p-1.5 rounded-2xl border border-brand-steel w-full md:w-auto">
                            <button 
                                onClick={() => handleTypeToggle('visitors')}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === 'visitors' ? 'bg-brand-amber text-brand-charcoal shadow-lg' : 'text-brand-text-muted hover:text-brand-text'}`}
                            >
                                Visitantes
                            </button>
                            <button 
                                onClick={() => handleTypeToggle('deliveries')}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === 'deliveries' ? 'bg-brand-blue text-brand-charcoal shadow-lg' : 'text-brand-text-muted hover:text-brand-text'}`}
                            >
                                Entregas
                            </button>
                        </div>
                        <button onClick={handleExport} className="w-full md:w-auto bg-feedback-success hover:scale-[1.02] active:scale-[0.98] text-brand-charcoal font-black py-3 px-6 rounded-2xl inline-flex items-center justify-center transition-all shadow-lg text-[10px] uppercase tracking-widest">
                            <ExportIcon className="h-5 w-5 mr-3" /> Exportar Planilha
                        </button>
                    </div>

                    {/* Controles de Data */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-brand-steel/50 pt-6">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-brand-text-muted uppercase ml-1">De (Entrada)</label>
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full bg-brand-charcoal border-brand-steel border-2 rounded-xl px-4 py-2 text-xs text-brand-text focus:border-brand-amber outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-brand-text-muted uppercase ml-1">Até (Entrada)</label>
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full bg-brand-charcoal border-brand-steel border-2 rounded-xl px-4 py-2 text-xs text-brand-text focus:border-brand-amber outline-none transition-all"
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1 space-y-1">
                            <label className="text-[9px] font-black text-brand-text-muted uppercase ml-1">Busca Rápida</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="NOME, PLACA OU EMPRESA..."
                                    className="w-full bg-brand-charcoal border-brand-steel border-2 rounded-xl px-4 py-2 pl-10 text-xs text-brand-text focus:border-brand-amber outline-none transition-all placeholder:text-brand-text-muted/30 uppercase font-bold"
                                />
                                <SearchIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-brand-text-muted" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Lista de Resultados */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
                            Foram encontrados <span className="text-brand-amber">{filteredData.length}</span> registros neste período
                        </p>
                    </div>

                    {filteredData.length === 0 ? <EmptyState /> : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredData.map(item => (
                                <div key={item.id} className="bg-brand-lead p-5 rounded-3xl shadow-xl relative border border-brand-steel hover:border-brand-slate transition-all group overflow-hidden">
                                    {item.exitTime && (
                                        <div className="absolute top-0 right-0">
                                            <div className="bg-feedback-success text-brand-charcoal text-[7px] font-black px-4 py-1.5 uppercase tracking-widest shadow-lg -rotate-12 translate-x-3 -translate-y-1">SAÍDA</div>
                                        </div>
                                    )}
                                    
                                    {reportType === 'visitors' && (
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div className="relative flex-shrink-0">
                                                <img 
                                                  src={(item as Visitor).photo} 
                                                  alt={(item as Visitor).name} 
                                                  className="w-24 h-24 rounded-2xl object-cover cursor-pointer ring-4 ring-brand-charcoal shadow-2xl group-hover:scale-105 transition-transform" 
                                                  onClick={() => handleViewPhoto((item as Visitor).photo)} 
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="font-black text-lg text-brand-amber uppercase leading-none mb-2">{(item as Visitor).name}</h3>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-bold">
                                                    <p className="text-brand-text-muted">DOC: <span className="text-brand-text uppercase">{(item as Visitor).document}</span></p>
                                                    <p className="text-brand-text-muted">EMPRESA: <span className="text-brand-text uppercase">{(item as Visitor).company}</span></p>
                                                    <p className="text-brand-text-muted">VEÍCULO: <span className="text-brand-text uppercase font-mono tracking-widest">{(item as Visitor).vehicle.plate || 'N/A'}</span></p>
                                                    <p className="text-brand-text-muted">ALVO: <span className="text-brand-text uppercase">{(item as Visitor).personVisited}</span></p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-brand-steel/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[7px] font-black text-brand-text-muted uppercase">Entrada</span>
                                                        <span className="text-[10px] font-black text-brand-text uppercase tracking-tight">{item.entryTime.toLocaleString('pt-BR')}</span>
                                                    </div>
                                                    {item.exitTime && (
                                                        <div className="flex flex-col">
                                                            <span className="text-[7px] font-black text-brand-text-muted uppercase">Saída</span>
                                                            <span className="text-[10px] font-black text-feedback-success uppercase tracking-tight">{item.exitTime.toLocaleString('pt-BR')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <EpiStatus epi={(item as Visitor).epi} />
                                            </div>
                                        </div>
                                    )}

                                    {reportType === 'deliveries' && (
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div className="flex gap-3 flex-shrink-0">
                                                <img src={(item as Delivery).invoicePhoto} className="w-20 h-24 rounded-xl object-cover cursor-pointer ring-4 ring-brand-charcoal shadow-2xl group-hover:-rotate-3 transition-transform" onClick={() => handleViewPhoto((item as Delivery).invoicePhoto)}/>
                                                <img src={(item as Delivery).platePhoto} className="w-20 h-24 rounded-xl object-cover cursor-pointer ring-4 ring-brand-charcoal shadow-2xl group-hover:rotate-3 transition-transform" onClick={() => handleViewPhoto((item as Delivery).platePhoto)} />
                                             </div>
                                            <div className="flex-grow">
                                                 <h3 className="font-black text-lg text-brand-blue uppercase leading-none mb-2">{(item as Delivery).supplier}</h3>
                                                 <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-bold">
                                                     <p className="text-brand-text-muted">MOTORA: <span className="text-brand-text uppercase">{(item as Delivery).driverName}</span></p>
                                                     <p className="text-brand-text-muted">PLACA: <span className="text-brand-text uppercase font-mono tracking-widest">{(item as Delivery).licensePlate}</span></p>
                                                     <p className="text-brand-text-muted">NF: <span className="text-brand-text">{(item as Delivery).invoiceNumber}</span></p>
                                                     <p className="text-brand-text-muted">DOC: <span className="text-brand-text">{(item as Delivery).driverDocument}</span></p>
                                                 </div>
                                                 <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-brand-steel/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[7px] font-black text-brand-text-muted uppercase">Entrada</span>
                                                        <span className="text-[10px] font-black text-brand-text uppercase tracking-tight">{item.entryTime.toLocaleString('pt-BR')}</span>
                                                    </div>
                                                    {item.exitTime && (
                                                        <div className="flex flex-col">
                                                            <span className="text-[7px] font-black text-brand-text-muted uppercase">Saída</span>
                                                            <span className="text-[10px] font-black text-feedback-success uppercase tracking-tight">{item.exitTime.toLocaleString('pt-BR')}</span>
                                                        </div>
                                                    )}
                                                 </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="Evidência Fotográfica">
                <div className="p-1">
                    <img src={photoModalUrl} alt="Visualização ampliada" className="w-full h-auto rounded-2xl shadow-2xl border-4 border-brand-charcoal" />
                </div>
            </Modal>
        </div>
    );
};

export default ReportsView;
