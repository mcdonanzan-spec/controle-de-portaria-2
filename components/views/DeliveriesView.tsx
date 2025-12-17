import React, { useState } from 'react';
import { Delivery } from '../../types';
import CameraCapture from '../CameraCapture';
import FormWrapper from '../FormWrapper';
import { TruckIcon, CheckCircleIcon, XCircleIcon } from '../icons';
import { formatDocument } from '../../utils/formatters';

interface DeliveriesViewProps {
    addDelivery: (delivery: Omit<Delivery, 'id' | 'entryTime' | 'exitTime'>) => void;
    showToast: (message: string) => void;
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

const DeliveriesView: React.FC<DeliveriesViewProps> = ({ addDelivery, showToast }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        for (const key in formData) {
            if (!formData[key as keyof typeof formData]) {
                setError('Todos os campos e fotos são obrigatórios.');
                return;
            }
        }
        setIsSubmitting(true);
        addDelivery(formData);
        showToast('Entrega registrada com sucesso!');
        handleClear();
        setIsSubmitting(false);
    };

    return (
        <FormWrapper title="Registro de Entrega" icon={<TruckIcon className="h-7 w-7" />} colorClass="bg-brand-blue">
            <form onSubmit={handleSubmit} noValidate>
                {error && <p className="text-feedback-error mb-4 bg-red-900/50 p-3 rounded-md">{error}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-brand-text text-sm font-bold mb-2">Número da Nota Fiscal *</label>
                        <input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Ex: 123456" />
                    </div>
                     <div>
                        <label className="block text-brand-text text-sm font-bold mb-2">Fornecedor *</label>
                        <input name="supplier" value={formData.supplier} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Nome da empresa" />
                    </div>
                    <div>
                        <label className="block text-brand-text text-sm font-bold mb-2">Motorista *</label>
                        <input name="driverName" value={formData.driverName} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Nome do motorista" />
                    </div>
                    <div>
                        <label className="block text-brand-text text-sm font-bold mb-2">Documento *</label>
                        <input name="driverDocument" value={formData.driverDocument} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="RG ou CPF" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-brand-text text-sm font-bold mb-2">Placa do Veículo *</label>
                        <input name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Ex: ABC1D23" maxLength={7} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <CameraCapture title="Foto da Nota Fiscal *" onCapture={(photo) => handlePhotoCapture('invoicePhoto', photo)} />
                    <CameraCapture title="Foto da Placa do Veículo *" onCapture={(photo) => handlePhotoCapture('platePhoto', photo)} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button type="button" onClick={handleClear} className="w-full flex items-center justify-center bg-brand-steel hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded transition-colors">
                        <XCircleIcon className="h-6 w-6 mr-2" /> Limpar
                    </button>
                    <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center bg-feedback-success hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded transition-colors disabled:bg-brand-slate disabled:cursor-not-allowed">
                        <CheckCircleIcon className="h-6 w-6 mr-2" /> {isSubmitting ? 'Registrando...' : 'Registrar Entrega'}
                    </button>
                </div>
            </form>
        </FormWrapper>
    );
};

export default DeliveriesView;