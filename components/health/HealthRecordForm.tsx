
import React, { useState, useEffect } from 'react';
import { HealthRecord } from '../../types';
import { CloseIcon, PlusIcon, TrashIcon } from '../icons/Icons';

interface HealthRecordFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (record: HealthRecord) => void;
    recordToEdit: HealthRecord | null;
    studentId: string;
    institutionId: string;
}

const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ isOpen, onClose, onSave, recordToEdit, studentId, institutionId }) => {
    
    const [formData, setFormData] = useState<Omit<HealthRecord, 'id'|'institutionId'|'studentId'>>({
        allergies: [],
        conditions: [],
        emergencyContact: { name: '', phone: '', relation: '' },
        medications: [],
        lastCheckup: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (recordToEdit) {
            setFormData({
                allergies: recordToEdit.allergies || [],
                conditions: recordToEdit.conditions || [],
                emergencyContact: recordToEdit.emergencyContact || { name: '', phone: '', relation: '' },
                medications: recordToEdit.medications || [],
                lastCheckup: recordToEdit.lastCheckup || new Date().toISOString().split('T')[0],
            });
        } else {
            // Reset form for creation
             setFormData({
                allergies: [],
                conditions: [],
                emergencyContact: { name: '', phone: '', relation: '' },
                medications: [],
                lastCheckup: new Date().toISOString().split('T')[0],
            });
        }
    }, [recordToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'allergies' || name === 'conditions') {
            setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(Boolean) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            emergencyContact: { ...prev.emergencyContact, [name]: value }
        }));
    };

    const handleMedicationChange = (index: number, field: 'name' | 'dosage' | 'notes', value: string) => {
        const newMeds = [...formData.medications];
        newMeds[index] = { ...newMeds[index], [field]: value };
        setFormData(prev => ({ ...prev, medications: newMeds }));
    };

    const addMedication = () => {
        setFormData(prev => ({
            ...prev,
            medications: [...prev.medications, { name: '', dosage: '', notes: '' }]
        }));
    };

    const removeMedication = (index: number) => {
        setFormData(prev => ({
            ...prev,
            medications: formData.medications.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const record: HealthRecord = {
            id: recordToEdit?.id || `hr-${Date.now()}`,
            institutionId,
            studentId,
            ...formData,
        };
        onSave(record);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{recordToEdit ? 'Editar' : 'Crear'} Ficha Médica</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6" /></button>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alergias (separadas por comas)</label>
                        <textarea name="allergies" value={formData.allergies.join(', ')} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Condiciones Médicas (separadas por comas)</label>
                        <textarea name="conditions" value={formData.conditions.join(', ')} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>

                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold px-2">Contacto de Emergencia</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Nombre</label>
                                <input type="text" name="name" value={formData.emergencyContact.name} onChange={handleContactChange} required className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Relación</label>
                                <input type="text" name="relation" value={formData.emergencyContact.relation} onChange={handleContactChange} required className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Teléfono</label>
                                <input type="tel" name="phone" value={formData.emergencyContact.phone} onChange={handleContactChange} required className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold px-2">Medicación</legend>
                        <div className="space-y-4">
                            {formData.medications.map((med, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end border-b pb-2">
                                    <div className="sm:col-span-3 grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium">Nombre</label>
                                            <input type="text" value={med.name} onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm" />
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium">Dosis</label>
                                            <input type="text" value={med.dosage} onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm" />
                                        </div>
                                         <div className="flex items-end">
                                             <button type="button" onClick={() => removeMedication(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-medium">Notas</label>
                                        <input type="text" value={med.notes} onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm" />
                                    </div>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={addMedication} className="mt-4 flex items-center gap-2 text-sm text-primary-600 hover:underline">
                            <PlusIcon className="h-4 w-4" /> Añadir Medicación
                        </button>
                    </fieldset>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha del Último Chequeo</label>
                        <input type="date" name="lastCheckup" value={formData.lastCheckup} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HealthRecordForm;
