
import React, { useState, useMemo, useEffect } from 'react';
import { Visitor, Delivery } from '../../types';
import Modal from '../Modal';
import { exportToCsv } from '../../services/csvExporter';
import { ExportIcon, TruckIcon, UserIcon, SearchIcon, HelmetIcon, BootsIcon, GlassesIcon, CheckCircleIcon, XCircleIcon, ReportsIcon, PencilIcon } from '../icons';
import { formatDocument } from '../../utils/formatters';

interface ReportsViewProps {
    visitors: Visitor[];
    deliveries: Delivery[];
    activeReportType?: 'deliveries' | 'visitors';
    onReportTypeChange?: (type: 'deliveries' | 'visitors') => void;
    onUpdateRecord: (type: 'visitor' | 'delivery', id: number, data: any) => Promise<boolean>;
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


const ReportsView: React.FC<ReportsViewProps> = ({ visitors, deliveries, activeReportType = 'visitors', onReportTypeChange, onUpdateRecord }) => {
    const [reportType, setReportType] = useState<'deliveries' | 'visitors'>(activeReportType);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [photoModalUrl, setPhotoModalUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estados para Edição
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [isUpdating, setIsUpdating] = useState(false);

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

    const handleEditClick = (item: any) => {
        setEditingRecord(item);
        if (reportType === 'visitors') {
            setEditFormData({
                name: item.name,
                document: item.document,
                company: item.company,
                visit_reason: item.visitReason,
                person_visited: item.personVisited,
                vehicle_model: item.vehicle.model,
                vehicle_color: item.vehicle.color,
                vehicle_plate: item.vehicle.plate,
                helmet: item.epi.helmet,
                boots: item.epi.boots,
                glasses: item.epi.glasses,
            });
        } else {
            setEditFormData({
                supplier: item.supplier,
                driver_name: item.driverName,
                driver_document: item.driverDocument,
                invoice_number: item.invoiceNumber,
                license_plate: item.licensePlate,
            });
        }
        setIsEditModalOpen(true);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setEditFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value.toUpperCase() 
        }));
    };

    const handleSaveEdit = async () => {
        setIsUpdating(true);
        const type = reportType === 'visitors' ? 'visitor' : 'delivery';
        
        // Garantimos que o payload enviado use snake_case se for visitante (para evitar erros de banco)
        let payload = { ...editFormData };
        
        const success = await onUpdateRecord(type, editingRecord.id, payload);
        if (success) {
            setIsEditModalOpen(false);
            setEditingRecord(null);
        }
        setIsUpdating(false);
    };

    const filteredData = useMemo(() => {
        const data = reportType === 'visitors' ? visitors : deliveries;
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        return data.filter(item => {
            const itemDate = new Date(item.entryTime);
            if (itemDate < start || itemDate > end) return false;

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
                                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                                        <button 
                                          onClick={() => handleEditClick(item)}
                                          className="p-2 bg-brand-charcoal hover:bg-brand-slate text-brand-amber rounded-full shadow-lg border border-brand-steel transition-all active:scale-90"
                                          title="Editar Registro"
                                        >
                                          <PencilIcon className="h-4 w-4" />
                                        </button>
                                        {item.exitTime && (
                                            <div className="bg-feedback-success text-brand-charcoal text-[7px] font-black px-4 py-1.5 uppercase tracking-widest shadow-lg -rotate-12 translate-x-3 -translate-y-1">SAÍDA</div>
                                        )}
                                    </div>
                                    
                                    {reportType === 'visitors' && (
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div className="relative flex-shrink-0 flex gap-2">
                                                <img 
                                                  src={(item as Visitor).photo} 
                                                  alt={(item as Visitor).name} 
                                                  className="w-24 h-24 rounded-2xl object-cover cursor-pointer ring-4 ring-brand-charcoal shadow-2xl group-hover:scale-105 transition-transform" 
                                                  onClick={() => handleViewPhoto((item as Visitor).photo)} 
                                                />
                                                {(item as Visitor).platePhoto && (
                                                    <img 
                                                      src={(item as Visitor).platePhoto} 
                                                      alt="Placa" 
                                                      className="w-24 h-24 rounded-2xl object-cover cursor-pointer ring-4 ring-brand-charcoal shadow-2xl group-hover:scale-105 transition-transform" 
                                                      onClick={() => handleViewPhoto((item as Visitor).platePhoto!)} 
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-grow pt-2">
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
                                            <div className="flex-grow pt-2">
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

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Registro">
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1 custom-scrollbar">
                    {reportType === 'visitors' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Nome do Visitante</label>
                                <input name="name" value={editFormData.name} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Documento (RG/CPF)</label>
                                <input name="document" value={editFormData.document} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Empresa</label>
                                <input name="company" value={editFormData.company} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Motivo da Visita</label>
                                <input name="visit_reason" value={editFormData.visit_reason} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Responsável</label>
                                <input name="person_visited" value={editFormData.person_visited} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber" />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-3 gap-2 border-t border-brand-steel pt-4">
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="helmet" checked={editFormData.helmet} onChange={handleEditInputChange} className="h-4 w-4" />
                                    <span className="text-[9px] font-black uppercase">Capacete</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="boots" checked={editFormData.boots} onChange={handleEditInputChange} className="h-4 w-4" />
                                    <span className="text-[9px] font-black uppercase">Botina</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="glasses" checked={editFormData.glasses} onChange={handleEditInputChange} className="h-4 w-4" />
                                    <span className="text-[9px] font-black uppercase">Óculos</span>
                                 </label>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Modelo/Cor Veículo</label>
                                <input name="vehicle_model" value={editFormData.vehicle_model} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Placa</label>
                                <input name="vehicle_plate" value={editFormData.vehicle_plate} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-amber font-mono" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Fornecedor</label>
                                <input name="supplier" value={editFormData.supplier} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-blue" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Nome do Motorista</label>
                                <input name="driver_name" value={editFormData.driver_name} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-blue" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Documento Motorista</label>
                                <input name="driver_document" value={editFormData.driver_document} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-blue" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Número Nota Fiscal</label>
                                <input name="invoice_number" value={editFormData.invoice_number} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-blue" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-brand-text-muted">Placa do Veículo</label>
                                <input name="license_plate" value={editFormData.license_plate} onChange={handleEditInputChange} className="w-full bg-brand-steel border-brand-slate border rounded-xl py-2 px-3 text-xs text-brand-text outline-none focus:border-brand-blue font-mono" />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-6 border-t border-brand-steel">
                         <button 
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 py-4 bg-brand-steel hover:bg-brand-slate text-white font-black uppercase text-[10px] rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            disabled={isUpdating}
                            onClick={handleSaveEdit}
                            className={`flex-1 py-4 text-brand-charcoal font-black uppercase text-[10px] rounded-xl shadow-lg transition-all active:scale-95 ${reportType === 'visitors' ? 'bg-brand-amber' : 'bg-brand-blue'} disabled:opacity-50`}
                        >
                            {isUpdating ? 'Salvando...' : 'Confirmar Alterações'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ReportsView;
