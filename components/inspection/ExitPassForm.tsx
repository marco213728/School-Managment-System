import React, { useState } from 'react';
import { CloseIcon } from '../icons/Icons';

interface ExitPassFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: { reason: string; responsibleName: string; responsibleId: string; }) => void;
    studentName: string;
}

const ExitPassForm: React.FC<ExitPassFormProps> = ({ isOpen, onClose, onSave, studentName }) => {
    const [reason, setReason] = useState('');
    const [responsibleName, setResponsibleName] = useState('');
    const [responsibleId, setResponsibleId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ reason, responsibleName, responsibleId });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-2">Registrar Pase de Salida</h2>
                <p className="text-sm text-gray-500 mb-4">Para: <span className="font-semibold">{studentName}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Motivo de la Salida</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="Ej: Cita médica, calamidad doméstica, etc."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Persona que Retira</label>
                        <input
                            type="text"
                            value={responsibleName}
                            onChange={(e) => setResponsibleName(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cédula / ID de la Persona que Retira</label>
                        <input
                            type="text"
                            value={responsibleId}
                            onChange={(e) => setResponsibleId(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar y Generar Pase</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExitPassForm;