
import React, { useState, useEffect } from 'react';
import { InspectionVisit } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface InspectionVisitFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (visit: Omit<InspectionVisit, 'id' | 'institutionId' | 'inspectorId'> & { id?: string }) => void;
    visitToEdit: InspectionVisit | null;
}

const InspectionVisitForm: React.FC<InspectionVisitFormProps> = ({ isOpen, onClose, onSave, visitToEdit }) => {
    const [formData, setFormData] = useState({
        target: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Ordinaria' as InspectionVisit['type'],
        status: 'Programada' as InspectionVisit['status'],
        findings: ''
    });

    useEffect(() => {
        if (visitToEdit) {
            setFormData({
                target: visitToEdit.target,
                date: visitToEdit.date,
                type: visitToEdit.type,
                status: visitToEdit.status,
                findings: visitToEdit.findings,
            });
        } else {
            setFormData({
                target: '',
                date: new Date().toISOString().split('T')[0],
                type: 'Ordinaria',
                status: 'Programada',
                findings: ''
            });
        }
    }, [visitToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: visitToEdit?.id });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-gray-800">{visitToEdit ? 'Editar Inspección' : 'Nueva Visita de Inspección'}</h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Área / Objetivo de Inspección</label>
                        <input 
                            type="text" 
                            name="target" 
                            value={formData.target} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" 
                            placeholder="Ej: Laboratorios, Baños Bloque B, Aulas 3ro EGB..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input 
                                type="date" 
                                name="date" 
                                value={formData.date} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select 
                                name="type" 
                                value={formData.type} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="Ordinaria">Ordinaria</option>
                                <option value="Extraordinaria">Extraordinaria</option>
                                <option value="Auditoría">Auditoría</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <select 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="Programada">Programada</option>
                            <option value="Realizada">Realizada</option>
                            <option value="Informe Pendiente">Informe Pendiente</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hallazgos / Observaciones</label>
                        <textarea 
                            name="findings" 
                            value={formData.findings} 
                            onChange={handleChange} 
                            rows={4} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Describa lo observado durante la visita..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700">Guardar Visita</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InspectionVisitForm;
