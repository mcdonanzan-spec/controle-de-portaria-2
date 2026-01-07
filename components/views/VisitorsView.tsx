
import React, { useState } from 'react';
import { Visitor } from '../../types';
import CameraCapture from '../CameraCapture';
import FormWrapper from '../FormWrapper';
import { UserIcon, CheckCircleIcon, XCircleIcon } from '../icons';
import { formatDocument } from '../../utils/formatters';

interface VisitorsViewProps {
    addVisitor: (visitor: Omit<Visitor, 'id' | 'entryTime' | 'exitTime'>) => Promise<boolean>;
}

const initialFormData = {
    name: '',
    document: '',
    company: '',
    visitReason: '',
    personVisited: '',
    photo: '',
    platePhoto: '',
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

const VisitorsView: React.FC<VisitorsViewProps> = ({ addVisitor }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cameraKey, setCameraKey] = useState(0); 

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        if (name.startsWith('epi-')) {
            const epiKey = name.split('-')[1] as keyof typeof initialFormData.epi;
            setFormData(prev => ({ ...prev, epi: { ...prev.epi, [epiKey]: checked } }));
        } else if (name.startsWith('vehicle-')) {
            const vehicleKey = name.split('-')[1] as keyof typeof initialFormData.vehicle;
            const upperValue = value.toUpperCase();
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

    const handlePlatePhotoCapture = (photo: string) => {
        setFormData(prev => ({ ...prev, platePhoto: photo }));
    };
    
    const handleClear = () => {
        setFormData(initialFormData);
        setError('');
        setCameraKey(prev => prev + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(isSubmitting) return;

        const requiredFields: (keyof typeof initialFormData)[] = ['name', 'document', 'company', 'visitReason', 'personVisited', 'photo'];
        for (const field of requiredFields) {
            if (!formData[field as keyof typeof formData]) {
                setError(`O campo ${field === 'photo' ? 'FOTO' : 'ACIMA'} é obrigatório.`);
                return;
            }
        }

        if (!formData.epi.helmet) {
            setError('O uso de CAPACETE é obrigatório para qualquer visitante no canteiro.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        
        const success = await addVisitor(formData);
        
        if (success) {
            handleClear();
        }
        
        setIsSubmitting(false);
    };

    return (
        <FormWrapper title="Cadastro de Visitante" icon={<UserIcon className="h-7 w-7" />} colorClass="bg-brand-amber">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                        <XCircleIcon className="text-red-500 h-5 w-5 shrink-0" />
                        <p className="text-red-400 text-xs font-black uppercase tracking-tight">{error}</p>
                    </div>
                )}
                
                <fieldset className="border border-brand-steel p-5 rounded-2xl bg-brand-charcoal/30">
                    <legend className="px-3 font-black text-[10px] text-brand-amber uppercase tracking-widest">Identificação do Visitante</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Nome Completo *</label>
                            <input name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text outline-none focus:border-brand-amber transition-all" type="text" placeholder="NOME DO VISITANTE" />
                        </div>
                        <div>
                            <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Documento (RG/CPF) *</label>
                            <input name="document" value={formData.document} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text outline-none focus:border-brand-amber transition-all" type="text" placeholder="000.000.000-00" />
                        </div>
                        <div>
                            <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Empresa de Origem *</label>
                            <input name="company" value={formData.company} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text outline-none focus:border-brand-amber transition-all" type="text" placeholder="NOME DA EMPRESA" />
                        </div>
                        <div>
                            <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Motivo da Visita *</label>
                            <input name="visitReason" value={formData.visitReason} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text outline-none focus:border-brand-amber transition-all" type="text" placeholder="EX: REUNIÃO TÉCNICA" />
                        </div>
                        <div>
                            <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Aos cuidados de (Pessoa) *</label>
                            <input name="personVisited" value={formData.personVisited} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text outline-none focus:border-brand-amber transition-all" type="text" placeholder="NOME DO RESPONSÁVEL NA OBRA" />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border border-brand-steel p-5 rounded-2xl bg-brand-charcoal/30">
                    <legend className="px-3 font-black text-[10px] text-brand-amber uppercase tracking-widest">Segurança e Veículo</legend>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.epi.helmet ? 'bg-feedback-success/10 border-feedback-success text-feedback-success shadow-[0_0_15px_rgba(46,204,113,0.1)]' : 'bg-brand-steel border-brand-slate text-brand-text-muted opacity-60'}`}>
                                <input type="checkbox" name="epi-helmet" checked={formData.epi.helmet} onChange={handleInputChange} className="h-5 w-5 rounded border-2 border-brand-slate text-feedback-success focus:ring-feedback-success" />
                                <div className="flex flex-col">
                                    <span className="font-black text-[10px] uppercase tracking-wider leading-none">Capacete</span>
                                    <span className="text-[8px] font-bold uppercase text-brand-amber mt-1">Obrigatório</span>
                                </div>
                            </label>
                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.epi.boots ? 'bg-feedback-success/10 border-feedback-success text-feedback-success shadow-[0_0_15px_rgba(46,204,113,0.1)]' : 'bg-brand-steel border-brand-slate text-brand-text-muted'}`}>
                                <input type="checkbox" name="epi-boots" checked={formData.epi.boots} onChange={handleInputChange} className="h-5 w-5 rounded border-2 border-brand-slate text-feedback-success focus:ring-feedback-success" />
                                <span className="font-black text-[10px] uppercase tracking-wider">Botina</span>
                            </label>
                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.epi.glasses ? 'bg-feedback-success/10 border-feedback-success text-feedback-success shadow-[0_0_15px_rgba(46,204,113,0.1)]' : 'bg-brand-steel border-brand-slate text-brand-text-muted'}`}>
                                <input type="checkbox" name="epi-glasses" checked={formData.epi.glasses} onChange={handleInputChange} className="h-5 w-5 rounded border-2 border-brand-slate text-feedback-success focus:ring-feedback-success" />
                                <span className="font-black text-[10px] uppercase tracking-wider">Óculos</span>
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-steel pt-4">
                            <div>
                                <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Veículo / Placa (Opcional)</label>
                                <input name="vehicle-plate" value={formData.vehicle.plate} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text outline-none focus:border-brand-amber transition-all font-mono tracking-widest" type="text" placeholder="ABC1D23" maxLength={7} />
                            </div>
                            <div>
                                <label className="block text-brand-text-muted text-[10px] font-black uppercase mb-1 ml-1">Modelo / Cor</label>
                                <input name="vehicle-model" value={formData.vehicle.model} onChange={handleInputChange} className="w-full bg-brand-steel border-brand-slate border-2 rounded-xl py-2 px-3 text-brand-text outline-none focus:border-brand-amber transition-all" type="text" placeholder="EX: HILUX BRANCA" />
                            </div>
                        </div>
                    </div>
                </fieldset>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CameraCapture key={`vphoto-${cameraKey}`} title="Foto do Visitante *" onCapture={handlePhotoCapture} />
                  <CameraCapture key={`pphoto-${cameraKey}`} title="Foto da Placa (Se houver)" onCapture={handlePlatePhotoCapture} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-brand-steel">
                    <button type="button" onClick={handleClear} className="w-full bg-brand-steel hover:bg-brand-slate text-white font-black py-4 rounded-xl transition-all uppercase text-[10px] tracking-widest">
                        <XCircleIcon className="h-5 w-5 mr-2" /> Limpar Formulário
                    </button>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-feedback-success hover:scale-[1.02] active:scale-[0.98] text-brand-charcoal font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-widest shadow-lg shadow-feedback-success/20">
                        {isSubmitting ? 'Salvando no Banco...' : <><CheckCircleIcon className="h-5 w-5 mr-2" /> Finalizar Registro</>}
                    </button>
                </div>
            </form>
        </FormWrapper>
    );
};

export default VisitorsView;
