
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
        <h3 className="mt-4 text-xs font-black text-brand-text uppercase tracking-widest">Nenhum registro encontrado</h3>
        <p className="mt-2 text-[10px] text-brand-text-muted font-bold uppercase">Utilize a busca ou altere o filtro acima.</p>
    </div>
);

const EpiStatus: React.FC<{ epi: Visitor['epi'] }> = ({ epi }) => (
    <div className="flex items-center gap-2 mt-4">
        {(Object.keys(epi) as Array<keyof typeof epi>).map(key => {
            const isActive = epi[key];
            const Icon = key === 'helmet' ? HelmetIcon : key === 'boots' ? BootsIcon : GlassesIcon;
            return (
                <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${isActive ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400/50'}`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{key === 'helmet' ? 'CAPACETE' : key === 'boots' ? 'BOTINA' : 'ÓCULOS'}</span>
                </div>
            );
        })}
    </div>
);


const ReportsView: React.FC<ReportsViewProps> = ({ visitors, deliveries, activeReportType = 'visitors', onReportTypeChange }) => {
    const [reportType, setReportType] = useState<'deliveries' | 'visitors'>(activeReportType);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [photoModalUrl, setPhotoModalUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Sincroniza estado interno com externo caso mude via Painel
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
         if (!searchTerm) return data;

        return data.filter(item => {
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

    }, [reportType, searchTerm, visitors, deliveries]);

    return (
        <div className="p-4 sm:p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="bg-brand-lead p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 border border-brand-steel shadow-2xl">
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
                    <button onClick={() => exportToCsv(visitors, deliveries)} className="w-full md:w-auto bg-feedback-success hover:scale-[1.02] active:scale-[0.98] text-brand-charcoal font-black py-3 px-6 rounded-2xl inline-flex items-center justify-center transition-all shadow-lg text-[10px] uppercase tracking-widest">
                        <ExportIcon className="h-5 w-5 mr-3" /> Exportar Planilha
                    </button>
                </header>

                <div className="bg-brand-lead/40 p-6 rounded-3xl border border-brand-steel/50 backdrop-blur-sm">
                    <div className="relative mb-6">
                         <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`BUSCAR EM ${reportType === 'visitors' ? 'VISITANTES' : 'ENTREGAS'}...`}
                            className="w-full bg-brand-steel border-brand-slate border-2 rounded-2xl py-3 pl-12 pr-4 text-brand-text text-xs font-bold outline-none focus:border-brand-amber transition-all placeholder:text-brand-text-muted/50 uppercase"
                        />
                        <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-brand-text-muted" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-6 px-2">
                        <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
                            Mostrando <span className="text-brand-amber">{filteredData.length}</span> registros
                        </p>
                    </div>

                    <div className="space-y-4">
                        {filteredData.length === 0 && <EmptyState />}
                        
                        {filteredData.map(item => (
                            <div key={item.id} className="bg-brand-lead p-5 rounded-2xl shadow-xl relative border border-brand-steel hover:border-brand-slate transition-colors group">
                                {item.exitTime && (
                                    <span className="absolute top-4 right-4 bg-feedback-success/10 text-feedback-success text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-feedback-success/30">
                                        SAÍDA FINALIZADA
                                    </span>
                                )}
                                
                                {reportType === 'visitors' && (
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <img 
                                              src={(item as Visitor).photo} 
                                              alt={(item as Visitor).name} 
                                              className="w-24 h-24 rounded-2xl object-cover cursor-pointer ring-2 ring-brand-steel group-hover:ring-brand-amber transition-all shadow-lg" 
                                              onClick={() => handleViewPhoto((item as Visitor).photo)} 
                                            />
                                            <div className="absolute inset-0 bg-brand-amber/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none"></div>
                                        </div>
                                        <div className="w-full flex flex-col justify-center">
                                            <h3 className="font-black text-lg text-brand-amber uppercase tracking-tight flex items-center mb-1">
                                              {(item as Visitor).name}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11px] font-bold">
                                                <p className="text-brand-text-muted">DOC: <span className="text-brand-text uppercase">{(item as Visitor).document}</span></p>
                                                <p className="text-brand-text-muted">EMPRESA: <span className="text-brand-text uppercase">{(item as Visitor).company}</span></p>
                                                <p className="text-brand-text-muted">RESPONSÁVEL: <span className="text-brand-text uppercase">{(item as Visitor).personVisited}</span></p>
                                                { (item as Visitor).vehicle.plate && <p className="text-brand-text-muted">VEÍCULO: <span className="text-brand-text uppercase">{(item as Visitor).vehicle.plate} - {(item as Visitor).vehicle.model}</span></p>}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-brand-steel/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-feedback-success animate-pulse"></div>
                                                    <span className="text-[9px] font-black text-brand-text-muted uppercase">Entrada: {item.entryTime.toLocaleString('pt-BR')}</span>
                                                </div>
                                                {item.exitTime && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-brand-slate"></div>
                                                        <span className="text-[9px] font-black text-brand-text-muted uppercase">Saída: {item.exitTime.toLocaleString('pt-BR')}</span>
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
                                            <div className="relative group-hover:scale-105 transition-transform">
                                                <img src={(item as Delivery).invoicePhoto} className="w-20 h-24 rounded-xl object-cover cursor-pointer ring-2 ring-brand-steel group-hover:ring-brand-blue shadow-lg" onClick={() => handleViewPhoto((item as Delivery).invoicePhoto)}/>
                                                <span className="absolute bottom-1 left-1 bg-black/60 text-[6px] text-white px-1.5 py-0.5 rounded uppercase font-black">NOTA</span>
                                            </div>
                                            <div className="relative group-hover:scale-105 transition-transform delay-75">
                                                <img src={(item as Delivery).platePhoto} className="w-20 h-24 rounded-xl object-cover cursor-pointer ring-2 ring-brand-steel group-hover:ring-brand-blue shadow-lg" onClick={() => handleViewPhoto((item as Delivery).platePhoto)} />
                                                <span className="absolute bottom-1 left-1 bg-black/60 text-[6px] text-white px-1.5 py-0.5 rounded uppercase font-black">PLACA</span>
                                            </div>
                                         </div>
                                        <div className="w-full flex flex-col justify-center">
                                             <h3 className="font-black text-lg text-brand-blue uppercase tracking-tight flex items-center mb-1">
                                               {(item as Delivery).supplier}
                                             </h3>
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11px] font-bold">
                                                 <p className="text-brand-text-muted">MOTORISTA: <span className="text-brand-text uppercase">{(item as Delivery).driverName}</span></p>
                                                 <p className="text-brand-text-muted">PLACA: <span className="text-brand-text uppercase font-mono tracking-widest">{(item as Delivery).licensePlate}</span></p>
                                                 <p className="text-brand-text-muted">NF: <span className="text-brand-text">{(item as Delivery).invoiceNumber}</span></p>
                                                 <p className="text-brand-text-muted">DOC: <span className="text-brand-text">{(item as Delivery).driverDocument}</span></p>
                                             </div>
                                             <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-brand-steel/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
                                                    <span className="text-[9px] font-black text-brand-text-muted uppercase">Entrada: {item.entryTime.toLocaleString('pt-BR')}</span>
                                                </div>
                                                {item.exitTime && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-brand-slate"></div>
                                                        <span className="text-[9px] font-black text-brand-text-muted uppercase">Saída: {item.exitTime.toLocaleString('pt-BR')}</span>
                                                    </div>
                                                )}
                                             </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
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
