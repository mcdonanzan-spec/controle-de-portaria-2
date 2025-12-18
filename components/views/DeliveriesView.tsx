
import React, { useState } from 'react';
import { Delivery } from '../../types';
import CameraCapture from '../CameraCapture';
import FormWrapper from '../FormWrapper';
import { TruckIcon, CheckCircleIcon, XCircleIcon } from '../icons';
import { formatDocument } from '../../utils/formatters';

interface DeliveriesViewProps {
    addDelivery: (delivery: Omit<Delivery, 'id' | 'entryTime' | 'exitTime'>) => Promise<boolean>;
}

const initialFormData = {
    supplier: '',
    driverName: '',
    driverDocument: '',
    invoiceNumber: '',
    licensePlate: '',
    invoicePhoto: '',
    platePhoto: '',
};

const DeliveriesView: React.FC<DeliveriesViewProps> = ({ addDelivery }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cameraKey, setCameraKey] = useState(0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'driverDocument') {
            setFormData(prev => ({ ...prev, [name]: formatDocument(value) }));
        } else if (['supplier', 'driverName', 'licensePlate'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhotoCapture = (field: keyof typeof initialFormData, photo: string) => {
        setFormData(prev => ({ ...prev, [field]: photo }));
    };

    const handleClear = () => {
        setFormData(initialFormData);
        setError('');
        setCameraKey(prev => prev + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validação básica
        const required = ['invoiceNumber', 'supplier', 'driverName', 'driverDocument', 'licensePlate', 'invoicePhoto', 'platePhoto'];
        for (const field of required) {
            if (!formData[field as keyof typeof formData]) {
                setError('Todos os campos e fotos são obrigatórios para segurança.');
                return;
            }
        }

        setIsSubmitting(true);
        setError('');
        
        const success = await addDelivery(formData);
        
        if (success) {
            handleClear();
        }
        
        setIsSubmitting(false);
    };

    return (
        <FormWrapper title="Registro de Entrega" icon={<TruckIcon className="h-7 w-7" />} colorClass="bg-brand-blue">
            <form onSubmit={handleSubmit} noValidate>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-6 flex items-center gap-3 animate-pulse">
                        <XCircleIcon className="text-red-500 h-5 w-5 shrink-0" />
                        <p className="text-red-400 text-xs font-black uppercase">{error}</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Número da Nota Fiscal *</label>
                        <input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text focus:border-brand-blue outline-none transition-all" type="text" placeholder="Ex: 123456" />
                    </div>
                     <div>
                        <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Fornecedor *</label>
                        <input name="supplier" value={formData.supplier} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text focus:border-brand-blue outline-none transition-all" type="text" placeholder="NOME DA EMPRESA" />
                    </div>
                    <div>
                        <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Motorista *</label>
                        <input name="driverName" value={formData.driverName} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text focus:border-brand-blue outline-none transition-all" type="text" placeholder="NOME DO MOTORISTA" />
                    </div>
                    <div>
                        <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Documento *</label>
                        <input name="driverDocument" value={formData.driverDocument} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text focus:border-brand-blue outline-none transition-all" type="text" placeholder="RG OU CPF" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Placa do Veículo *</label>
                        <input name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text focus:border-brand-blue outline-none transition-all font-mono tracking-widest" type="text" placeholder="ABC1D23" maxLength={7} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <CameraCapture key={`inv-${cameraKey}`} title="Foto da Nota Fiscal *" onCapture={(photo) => handlePhotoCapture('invoicePhoto', photo)} />
                    <CameraCapture key={`plt-${cameraKey}`} title="Foto da Placa *" onCapture={(photo) => handlePhotoCapture('platePhoto', photo)} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button type="button" onClick={handleClear} className="w-full flex items-center justify-center bg-brand-steel hover:bg-brand-slate text-white font-black py-4 rounded-xl transition-all uppercase text-[10px] tracking-widest">
                        <XCircleIcon className="h-5 w-5 mr-2" /> Limpar Campos
                    </button>
                    <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center bg-feedback-success hover:scale-[1.02] active:scale-[0.98] text-brand-charcoal font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-widest shadow-lg shadow-feedback-success/20">
                        {isSubmitting ? 'Salvando...' : <><CheckCircleIcon className="h-5 w-5 mr-2" /> Registrar Entrega</>}
                    </button>
                </div>
            </form>
        </FormWrapper>
    );
};

export default DeliveriesView;
