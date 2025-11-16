import React, { useState, useEffect, useMemo } from 'react';
import { Subject, User, Role } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface SubjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (subjectData: Omit<Subject, 'id' | 'institutionId'> & { id?: string }) => void;
    subjectToEdit: Subject | null;
    allUsers: User[];
}

const SubjectForm: React.FC<SubjectFormProps> = ({ isOpen, onClose, onSave, subjectToEdit, allUsers }) => {
    const [formData, setFormData] = useState({
        id: undefined as string | undefined,
        name: '',
        teacherId: '',
        maxWeeklyHours: undefined as number | undefined,
    });

    const teachers = useMemo(() => allUsers.filter(u => u.role === Role.Teacher), [allUsers]);

    useEffect(() => {
        if (subjectToEdit) {
            setFormData({
                id: subjectToEdit.id,
                name: subjectToEdit.name,
                teacherId: subjectToEdit.teacherId,
                maxWeeklyHours: subjectToEdit.maxWeeklyHours,
            });
        } else {
            setFormData({ id: undefined, name: '', teacherId: '', maxWeeklyHours: undefined });
        }
    }, [subjectToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? (value ? Number(value) : undefined) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">{subjectToEdit ? 'Editar Asignatura' : 'Añadir Asignatura'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Asignatura</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Ej: Matemáticas" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Horas Semanales Máximas</label>
                        <input type="number" name="maxWeeklyHours" value={formData.maxWeeklyHours || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Ej: 5" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Profesor</label>
                        <select name="teacherId" value={formData.teacherId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
                            <option value="">-- Seleccionar Profesor --</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
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

export default SubjectForm;