import React, { useState, useMemo } from 'react';
import { Visitor, Delivery } from '../../types';
import Modal from '../Modal';
import { exportToCsv } from '../../services/csvExporter';
import { ExportIcon, TruckIcon, UserIcon, SearchIcon, HelmetIcon, BootsIcon, GlassesIcon, CheckCircleIcon, XCircleIcon, ReportsIcon } from '../icons';

interface ReportsViewProps {
    visitors: Visitor[];
    deliveries: Delivery[];
}

const EmptyState: React.FC = () => (
    <div className="text-center py-16">
        <ReportsIcon className="mx-auto h-16 w-16 text-brand-slate" />
        <h3 className="mt-2 text-lg font-medium text-brand-text">Nenhum registro encontrado</h3>
        <p className="mt-1 text-sm text-brand-text-muted">Quando os registros forem adicionados, eles aparecerão aqui.</p>
    </div>
);

const EpiStatus: React.FC<{ epi: Visitor['epi'] }> = ({ epi }) => (
    <div className="flex items-center gap-4 mt-2">
        {(Object.keys(epi) as Array<keyof typeof epi>).map(key => {
            const isActive = epi[key];
            const Icon = key === 'helmet' ? HelmetIcon : key === 'boots' ? BootsIcon : GlassesIcon;
            return (
                <div key={key} className={`flex items-center gap-1 p-2 rounded-lg ${isActive ? 'bg-green-800/50' : 'bg-red-800/50'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-green-300' : 'text-red-300'}`} />
                    {isActive 
                        ? <CheckCircleIcon className="h-4 w-4 text-green-300" /> 
                        : <XCircleIcon className="h-4 w-4 text-red-300" />}
                </div>
            );
        })}
    </div>
);


const ReportsView: React.FC<ReportsViewProps> = ({ visitors, deliveries }) => {
    const [reportType, setReportType] = useState<'deliveries' | 'visitors'>('visitors');
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [photoModalUrl, setPhotoModalUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleViewPhoto = (url: string) => {
        if(!url) return;
        setPhotoModalUrl(url);
        setIsPhotoModalOpen(true);
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
        <div className="p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="bg-brand-lead p-4 rounded-t-lg flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-brand-steel">
                    <div className="flex items-center gap-4">
                        <label htmlFor="reportType" className="font-semibold text-sm sm:text-base">Tipo:</label>
                        <select
                            id="reportType"
                            value={reportType}
                            onChange={(e) => {setReportType(e.target.value as 'deliveries' | 'visitors'); setSearchTerm('');}}
                            className="bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text"
                        >
                            <option value="visitors">Visitantes</option>
                            <option value="deliveries">Entregas</option>
                        </select>
                    </div>
                    <button onClick={() => exportToCsv(visitors, deliveries)} className="bg-feedback-success hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md inline-flex items-center transition-colors w-full sm:w-auto">
                        <ExportIcon className="h-5 w-5 mr-2" /> Exportar CSV
                    </button>
                </header>

                <div className="bg-brand-lead/60 p-4 rounded-b-lg">
                    <div className="relative mb-4">
                         <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full bg-brand-steel border-brand-slate border rounded py-2 pl-10 pr-3 text-brand-text"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-brand-text-muted" />
                    </div>
                    <p className="text-lg font-semibold mb-4 text-brand-text-muted">Total de registros: {filteredData.length}</p>

                    <div className="space-y-4">
                        {filteredData.length === 0 && <EmptyState />}
                        
                        {filteredData.map(item => (
                            <div key={item.id} className="bg-brand-lead p-4 rounded-lg shadow-md relative border border-brand-steel">
                                {item.exitTime && <span className="absolute top-2 right-2 bg-feedback-success text-white text-xs font-bold px-2 py-1 rounded-full">Saída Registrada</span>}
                                
                                {reportType === 'visitors' && (
                                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                                        <img src={(item as Visitor).photo} alt={(item as Visitor).name} className="w-24 h-24 rounded-md object-cover flex-shrink-0 cursor-pointer" onClick={() => handleViewPhoto((item as Visitor).photo)} />
                                        <div className="w-full">
                                            <h3 className="font-bold text-xl text-brand-amber flex items-center"><UserIcon className="h-5 w-5 mr-2" /> {(item as Visitor).name}</h3>
                                            <p><span className="font-semibold text-brand-text-muted">Documento:</span> {(item as Visitor).document}</p>
                                            <p><span className="font-semibold text-brand-text-muted">Empresa:</span> {(item as Visitor).company}</p>
                                            <p><span className="font-semibold text-brand-text-muted">Motivo:</span> {(item as Visitor).visitReason} | <span className="font-semibold">Visitando:</span> {(item as Visitor).personVisited}</p>
                                             { (item as Visitor).vehicle.plate && <p><span className="font-semibold text-brand-text-muted">Veículo:</span> {`${(item as Visitor).vehicle.model} - ${(item as Visitor).vehicle.color} | Placa: ${(item as Visitor).vehicle.plate}`}</p>}
                                            <div className="text-sm mt-2">
                                                <p><span className="font-semibold text-brand-text-muted">Entrada:</span> {item.entryTime.toLocaleString('pt-BR')}</p>
                                                {item.exitTime && <p><span className="font-semibold text-brand-text-muted">Saída:</span> {item.exitTime.toLocaleString('pt-BR')}</p>}
                                            </div>
                                            <EpiStatus epi={(item as Visitor).epi} />
                                        </div>
                                    </div>
                                )}

                                {reportType === 'deliveries' && (
                                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                                        <div className="flex gap-4 flex-shrink-0">
                                            <img src={(item as Delivery).invoicePhoto} alt="Nota Fiscal" className="w-24 h-24 rounded-md object-cover cursor-pointer" onClick={() => handleViewPhoto((item as Delivery).invoicePhoto)}/>
                                            <img src={(item as Delivery).platePhoto} alt="Placa" className="w-24 h-24 rounded-md object-cover cursor-pointer" onClick={() => handleViewPhoto((item as Delivery).platePhoto)} />
                                         </div>
                                        <div>
                                             <h3 className="font-bold text-xl text-brand-amber flex items-center"><TruckIcon className="h-5 w-5 mr-2" /> {(item as Delivery).supplier}</h3>
                                             <p><span className="font-semibold text-brand-text-muted">NF:</span> {(item as Delivery).invoiceNumber}</p>
                                             <p><span className="font-semibold text-brand-text-muted">Motorista:</span> {(item as Delivery).driverName} | <span className="font-semibold">Doc:</span> {(item as Delivery).driverDocument}</p>
                                             <p><span className="font-semibold text-brand-text-muted">Placa:</span> {(item as Delivery).licensePlate}</p>
                                             <div className="text-sm mt-2">
                                                <p><span className="font-semibold text-brand-text-muted">Entrada:</span> {item.entryTime.toLocaleString('pt-BR')}</p>
                                                {item.exitTime && <p><span className="font-semibold text-brand-text-muted">Saída:</span> {item.exitTime.toLocaleString('pt-BR')}</p>}
                                             </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="Visualizar Foto">
                <img src={photoModalUrl} alt="Visualização ampliada" className="w-full h-auto rounded-md" />
            </Modal>
        </div>
    );
};

export default ReportsView;