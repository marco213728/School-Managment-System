import React, { useState, useEffect } from 'react';
import { MedicalVisit, Diagnosis } from '../../types';
import { CloseIcon, PlusIcon, TrashIcon } from '../icons/Icons';

interface MedicalVisitFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (visit: MedicalVisit) => void;
    visitToEdit?: MedicalVisit | null;
    studentId: string;
    institutionId: string;
    healthProfessionalId: string;
}

const MedicalVisitForm: React.FC<MedicalVisitFormProps> = ({ isOpen, onClose, onSave, visitToEdit, studentId, institutionId, healthProfessionalId }) => {
    
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        motive: '',
        vitalSigns: { temperature: '', pulse: '', respiratoryRate: '', bloodPressure: '' },
        anthropometry: { weight: '', height: '', imc: '' },
        diagnoses: [] as Diagnosis[],
        treatmentPlan: { diagnostic: '', therapeutic: '', educational: '' },
        isReferred: false,
        referralDetails: '',
    });

    useEffect(() => {
        if (visitToEdit) {
            // Logic to populate form for editing (not requested, but good practice)
        } else {
            // Reset for new entry
             setFormData({
                date: new Date().toISOString().split('T')[0],
                motive: '',
                vitalSigns: { temperature: '', pulse: '', respiratoryRate: '', bloodPressure: '' },
                anthropometry: { weight: '', height: '', imc: '' },
                diagnoses: [{ code: '', description: '', type: 'PRE' }],
                treatmentPlan: { diagnostic: '', therapeutic: '', educational: '' },
                isReferred: false,
                referralDetails: '',
            });
        }
    }, [visitToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (category: 'vitalSigns' | 'anthropometry' | 'treatmentPlan', field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: value }
        }));
    };
    
    const handleDiagnosisChange = (index: number, field: keyof Diagnosis, value: string) => {
        const newDiagnoses = [...formData.diagnoses];
        newDiagnoses[index] = { ...newDiagnoses[index], [field]: value };
        setFormData(prev => ({ ...prev, diagnoses: newDiagnoses }));
    };

    const addDiagnosis = () => {
        setFormData(prev => ({
            ...prev,
            diagnoses: [...prev.diagnoses, { code: '', description: '', type: 'PRE' }]
        }));
    };

    const removeDiagnosis = (index: number) => {
        setFormData(prev => ({
            ...prev,
            diagnoses: formData.diagnoses.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalVisit: MedicalVisit = {
            id: visitToEdit?.id || `visit-${Date.now()}`,
            institutionId,
            studentId,
            healthProfessionalId,
            ...formData,
        };
        onSave(finalVisit);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{visitToEdit ? 'Editar' : 'Registrar'} Visita Médica</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6" /></button>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Fecha</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Motivo de la Consulta</label>
                            <input type="text" name="motive" value={formData.motive} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                    </div>

                    {/* Vitals & Anthropometry */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <fieldset className="border p-3 rounded-md">
                            <legend className="text-md font-semibold px-1">Signos Vitales</legend>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><label>Temperatura (°C)</label><input type="text" value={formData.vitalSigns.temperature} onChange={e => handleNestedChange('vitalSigns', 'temperature', e.target.value)} className="mt-1 w-full p-1 border rounded"/></div>
                                <div><label>Pulso (bpm)</label><input type="text" value={formData.vitalSigns.pulse} onChange={e => handleNestedChange('vitalSigns', 'pulse', e.target.value)} className="mt-1 w-full p-1 border rounded"/></div>
                                <div><label>Frec. Resp. (rpm)</label><input type="text" value={formData.vitalSigns.respiratoryRate} onChange={e => handleNestedChange('vitalSigns', 'respiratoryRate', e.target.value)} className="mt-1 w-full p-1 border rounded"/></div>
                                <div><label>Presión Art. (mmHg)</label><input type="text" value={formData.vitalSigns.bloodPressure} onChange={e => handleNestedChange('vitalSigns', 'bloodPressure', e.target.value)} className="mt-1 w-full p-1 border rounded"/></div>
                            </div>
                        </fieldset>
                        <fieldset className="border p-3 rounded-md">
                            <legend className="text-md font-semibold px-1">Antropometría</legend>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div><label>Peso (kg)</label><input type="text" value={formData.anthropometry.weight} onChange={e => handleNestedChange('anthropometry', 'weight', e.target.value)} className="mt-1 w-full p-1 border rounded"/></div>
                                <div><label>Talla (cm)</label><input type="text" value={formData.anthropometry.height} onChange={e => handleNestedChange('anthropometry', 'height', e.target.value)} className="mt-1 w-full p-1 border rounded"/></div>
                                <div><label>IMC</label><input type="text" value={formData.anthropometry.imc} onChange={e => handleNestedChange('anthropometry', 'imc', e.target.value)} className="mt-1 w-full p-1 border rounded"/></div>
                            </div>
                        </fieldset>
                    </div>

                    {/* Diagnoses */}
                    <fieldset className="border p-3 rounded-md">
                        <legend className="text-md font-semibold px-1">Diagnósticos (CIE-10)</legend>
                        <div className="space-y-3">
                            {formData.diagnoses.map((diag, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-2">
                                    <div className="col-span-3"><label className="text-xs">Código CIE-10</label><input type="text" value={diag.code} onChange={e => handleDiagnosisChange(index, 'code', e.target.value)} className="w-full p-1 border rounded text-sm"/></div>
                                    <div className="col-span-5"><label className="text-xs">Descripción</label><input type="text" value={diag.description} onChange={e => handleDiagnosisChange(index, 'description', e.target.value)} required className="w-full p-1 border rounded text-sm"/></div>
                                    <div className="col-span-3"><label className="text-xs">Tipo</label><select value={diag.type} onChange={e => handleDiagnosisChange(index, 'type', e.target.value as 'PRE' | 'DEF')} className="w-full p-1 border rounded bg-white text-sm"><option value="PRE">Presuntivo</option><option value="DEF">Definitivo</option></select></div>
                                    <div className="col-span-1"><button type="button" onClick={() => removeDiagnosis(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button></div>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addDiagnosis} className="mt-2 flex items-center gap-2 text-sm text-primary-600 hover:underline"><PlusIcon className="h-4 w-4" /> Añadir Diagnóstico</button>
                    </fieldset>

                    {/* Treatment Plan */}
                    <fieldset className="border p-3 rounded-md">
                        <legend className="text-md font-semibold px-1">Plan de Tratamiento</legend>
                        <div className="space-y-2 text-sm">
                            <div><label>Plan Diagnóstico</label><textarea value={formData.treatmentPlan.diagnostic} onChange={e => handleNestedChange('treatmentPlan', 'diagnostic', e.target.value)} rows={2} className="mt-1 w-full p-1 border rounded"></textarea></div>
                            <div><label>Plan Terapéutico</label><textarea value={formData.treatmentPlan.therapeutic} onChange={e => handleNestedChange('treatmentPlan', 'therapeutic', e.target.value)} rows={2} className="mt-1 w-full p-1 border rounded"></textarea></div>
                            <div><label>Plan Educacional</label><textarea value={formData.treatmentPlan.educational} onChange={e => handleNestedChange('treatmentPlan', 'educational', e.target.value)} rows={2} className="mt-1 w-full p-1 border rounded"></textarea></div>
                        </div>
                    </fieldset>

                    {/* Referral */}
                    <div>
                        <label className="flex items-center">
                            <input type="checkbox" checked={formData.isReferred} onChange={e => setFormData(prev => ({...prev, isReferred: e.target.checked}))} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"/>
                            <span className="ml-2 text-gray-700">Necesita Referencia a Centro Externo</span>
                        </label>
                        {formData.isReferred && (
                             <div>
                                <label className="block text-sm font-medium mt-2">Detalles de la Referencia</label>
                                <textarea name="referralDetails" value={formData.referralDetails} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border rounded-md"></textarea>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar Visita</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicalVisitForm;