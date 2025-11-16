import React, { useState, useEffect } from 'react';
import { LeccionarioEntry } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface LeccionarioFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<LeccionarioEntry, 'id' | 'institutionId' | 'teacherId'>) => void;
    entryToEdit: LeccionarioEntry | null;
    classId: string;
    subjectId: string;
    date: string;
    timeSlotId: string;
}

const LeccionarioForm: React.FC<LeccionarioFormProps> = ({ isOpen, onClose, onSave, entryToEdit, classId, subjectId, date, timeSlotId }) => {
    const [formData, setFormData] = useState({
        skillCode: '',
        topics: '',
        tasks: '',
        observations: ''
    });

    useEffect(() => {
        if (entryToEdit) {
            setFormData({
                skillCode: entryToEdit.skillCode,
                topics: entryToEdit.topics,
                tasks: entryToEdit.tasks,
                observations: entryToEdit.observations,
            });
        } else {
            setFormData({ skillCode: '', topics: '', tasks: '', observations: '' });
        }
    }, [entryToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            classId,
            subjectId,
            date,
            timeSlotId,
            ...formData,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{entryToEdit ? 'Editar' : 'Llenar'} Leccionario</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6" /></button>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
                    <div><label className="block text-sm font-medium">Código de Destreza</label><input type="text" name="skillCode" value={formData.skillCode} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div><label className="block text-sm font-medium">Temas</label><textarea name="topics" value={formData.topics} onChange={handleChange} required rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea></div>
                    <div><label className="block text-sm font-medium">Tareas</label><textarea name="tasks" value={formData.tasks} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea></div>
                    <div><label className="block text-sm font-medium">Observaciones</label><textarea name="observations" value={formData.observations} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea></div>
                    <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Guardar</button></div>
                </form>
            </div>
        </div>
    );
};

export default LeccionarioForm;
