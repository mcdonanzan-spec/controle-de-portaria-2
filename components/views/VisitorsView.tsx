import React, { useState } from 'react';
import { Visitor } from '../../types';
import CameraCapture from '../CameraCapture';
import FormWrapper from '../FormWrapper';
import { UserIcon, CheckCircleIcon, XCircleIcon } from '../icons';
import { formatDocument } from '../../utils/formatters';

interface VisitorsViewProps {
    addVisitor: (visitor: Omit<Visitor, 'id' | 'entryTime' | 'exitTime'>) => void;
    showToast: (message: string) => void;
}

const initialFormData = {
    name: '',
    document: '',
    company: '',
    visitReason: '',
    personVisited: '',
    photo: '',
    epi: {
        helmet: false,
        boots: false,
        glasses: false,
    },
    vehicle: {
        model: '',
        color: '',
        plate: '',
    }
};

const VisitorsView: React.FC<VisitorsViewProps> = ({ addVisitor, showToast }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('epi-')) {
            const epiKey = name.split('-')[1] as keyof typeof initialFormData.epi;
            setFormData(prev => ({ ...prev, epi: { ...prev.epi, [epiKey]: checked } }));
        } else if (name.startsWith('vehicle-')) {
            const vehicleKey = name.split('-')[1] as keyof typeof initialFormData.vehicle;
            const upperValue = ['model', 'color', 'plate'].includes(vehicleKey) ? value.toUpperCase() : value;
            setFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, [vehicleKey]: upperValue } }));
        } else if (name === 'document') {
            setFormData(prev => ({ ...prev, [name]: formatDocument(value) }));
        } else if (['name', 'company', 'visitReason', 'personVisited'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhotoCapture = (photo: string) => {
        setFormData(prev => ({ ...prev, photo }));
    };
    
    const handleClear = () => {
        setFormData(initialFormData);
        setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(isSubmitting) return;

        const requiredFields: (keyof typeof initialFormData)[] = ['name', 'document', 'company', 'visitReason', 'personVisited', 'photo'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                setError('Todos os campos de dados do visitante e a foto são obrigatórios.');
                return;
            }
        }
        if (!formData.epi.helmet || !formData.epi.boots || !formData.epi.glasses) {
            setError('Todos os EPIs são de uso obrigatório e devem ser confirmados.');
            return;
        }

        setIsSubmitting(true);
        addVisitor(formData);
        showToast('Visitante registrado com sucesso!');
        handleClear();
        setIsSubmitting(false);
    };

    return (
        <FormWrapper title="Cadastro de Visitante" icon={<UserIcon className="h-7 w-7" />} colorClass="bg-[#8E44AD]">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {error && <p className="text-feedback-error bg-red-900/50 p-3 rounded-md text-center font-semibold">{error}</p>}
                
                <fieldset className="border border-brand-steel p-4 rounded-lg">
                    <legend className="px-2 font-bold text-brand-amber">Dados Pessoais</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-brand-text text-sm font-bold mb-2">Nome Completo *</label>
                            <input name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Nome do visitante" />
                        </div>
                        <div>
                            <label className="block text-brand-text text-sm font-bold mb-2">Documento *</label>
                            <input name="document" value={formData.document} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="RG ou CPF" />
                        </div>
                        <div>
                            <label className="block text-brand-text text-sm font-bold mb-2">Empresa/Origem *</label>
                            <input name="company" value={formData.company} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Empresa do visitante" />
                        </div>
                        <div>
                            <label className="block text-brand-text text-sm font-bold mb-2">Motivo da Visita *</label>
                            <input name="visitReason" value={formData.visitReason} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Ex: Reunião, Vistoria" />
                        </div>
                        <div>
                            <label className="block text-brand-text text-sm font-bold mb-2">Pessoa/Setor a ser visitado *</label>
                            <input name="personVisited" value={formData.personVisited} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Ex: Eng. João" />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border border-brand-steel p-4 rounded-lg">
                    <legend className="px-2 font-bold text-brand-amber">Controle de EPI *</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.keys(formData.epi).map((key) => (
                             <label key={key} className="flex items-center space-x-2 cursor-pointer bg-brand-steel p-3 rounded-md">
                                <input type="checkbox" name={`epi-${key}`} checked={formData.epi[key as keyof typeof formData.epi]} onChange={handleInputChange} className="h-5 w-5 rounded text-brand-blue focus:ring-brand-blue" />
                                <span className="text-white font-medium capitalize">{key === 'helmet' ? 'Capacete' : key === 'boots' ? 'Bota' : 'Óculos'}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <fieldset className="border border-brand-steel p-4 rounded-lg">
                    <legend className="px-2 font-bold text-brand-amber">Veículo do Visitante (Opcional)</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-brand-text text-sm font-bold mb-2">Modelo</label>
                            <input name="vehicle-model" value={formData.vehicle.model} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Ex: Fiat Strada" />
                        </div>
                        <div>
                            <label className="block text-brand-text text-sm font-bold mb-2">Cor</label>
                            <input name="vehicle-color" value={formData.vehicle.color} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Ex: Branco" />
                        </div>
                        <div>
                            <label className="block text-brand-text text-sm font-bold mb-2">Placa</label>
                            <input name="vehicle-plate" value={formData.vehicle.plate} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border rounded py-2 px-3 text-brand-text" type="text" placeholder="Ex: ABC1D23" maxLength={7} />
                        </div>
                    </div>
                </fieldset>

                <CameraCapture title="Foto do Visitante *" onCapture={handlePhotoCapture} />

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-brand-steel">
                    <button type="button" onClick={handleClear} className="w-full flex items-center justify-center bg-brand-steel hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded transition-colors">
                        <XCircleIcon className="h-6 w-6 mr-2" /> Limpar
                    </button>
                    <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center bg-feedback-success hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded transition-colors disabled:bg-brand-slate disabled:cursor-not-allowed">
                        <CheckCircleIcon className="h-6 w-6 mr-2" /> {isSubmitting ? 'Registrando...' : 'Registrar Visitante'}
                    </button>
                </div>
            </form>
        </FormWrapper>
    );
};

export default VisitorsView;