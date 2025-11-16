import React, { useState, useEffect } from 'react';
import { Intervention, InterventionType } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface InterventionFormProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Correct the type to only expect fields managed by this form.
    onSave: (intervention: { id?: string; date: string; type: InterventionType; summary: string; participants: string[]; agreements: string; }) => void;
    interventionToEdit: Intervention | null;
    studentName: string;
}

const InterventionForm: React.FC<InterventionFormProps> = ({ isOpen, onClose, onSave, interventionToEdit, studentName }) => {
    const [formData, setFormData] = useState({
        id: undefined as string | undefined,
        date: new Date().toISOString().split('T')[0],
        type: InterventionType.IndividualSession,
        summary: '',
        participants: [] as string[],
        agreements: '',
    });

    useEffect(() => {
        if (interventionToEdit) {
            setFormData({
                id: interventionToEdit.id,
                date: interventionToEdit.date,
                type: interventionToEdit.type,
                summary: interventionToEdit.summary,
                participants: interventionToEdit.participants || [],
                agreements: interventionToEdit.agreements || '',
            });
        } else {
            setFormData({
                id: undefined,
                date: new Date().toISOString().split('T')[0],
                type: InterventionType.IndividualSession,
                summary: '',
                participants: [],
                agreements: '',
            });
        }
    }, [interventionToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'participants') {
            setFormData(prev => ({ ...prev, participants: value.split('\n') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, participants: formData.participants.filter(p => p.trim() !== '') });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{interventionToEdit ? 'Editar' : 'Registrar'} Intervención</h2>
                        <p className="text-sm text-gray-500">Para: {studentName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Intervención</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                                {Object.values(InterventionType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="participants" className="block text-sm font-medium text-gray-700">Participantes</label>
                        <textarea id="participants" name="participants" value={formData.participants.join('\n')} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" placeholder="Un participante por línea..."></textarea>
                    </div>
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Resumen / Motivo</label>
                        <textarea id="summary" name="summary" value={formData.summary} onChange={handleChange} rows={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                    <div>
                        <label htmlFor="agreements" className="block text-sm font-medium text-gray-700">Acuerdos y Compromisos (Opcional)</label>
                        <textarea id="agreements" name="agreements" value={formData.agreements} onChange={handleChange} rows={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" placeholder="Detalle los acuerdos alcanzados. Esta sección será visible en el documento para imprimir."></textarea>
                    </div>
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar Intervención</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InterventionForm;
