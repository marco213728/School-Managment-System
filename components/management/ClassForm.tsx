import React, { useState, useEffect, useMemo } from 'react';
// FIX: Add Timetable to imports to support new timetables prop
import { Class, User, Student, Role, Timetable } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface ClassFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (classData: Omit<Class, 'id' | 'institutionId'> & { id?: string }) => void;
    classToEdit: Class | null;
    allUsers: User[];
    allStudents: Student[];
    // FIX: Add timetables prop to allow assigning a timetable to a class
    timetables: Timetable[];
}

const ClassForm: React.FC<ClassFormProps> = ({ isOpen, onClose, onSave, classToEdit, allUsers, allStudents, timetables }) => {
    const [formData, setFormData] = useState({
        id: undefined as string | undefined,
        name: '',
        studentIds: [] as string[],
        // FIX: Add timetableId to form state
        timetableId: undefined as string | undefined,
    });

    useEffect(() => {
        if (classToEdit) {
            setFormData({
                id: classToEdit.id,
                name: classToEdit.name,
                studentIds: classToEdit.studentIds || [],
                // FIX: Set timetableId from classToEdit
                timetableId: classToEdit.timetableId,
            });
        } else {
            // FIX: Reset timetableId for new class
            setFormData({ id: undefined, name: '', studentIds: [], timetableId: undefined });
        }
    }, [classToEdit, isOpen]);

    // FIX: Use `e.currentTarget` to correctly access form element properties and avoid type errors.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.currentTarget;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // FIX: Use `e.currentTarget` to correctly access selected options from a multi-select element.
    const handleStudentIdsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // FIX: Explicitly type `option` as HTMLOptionElement to resolve `value` property access error.
        const values = Array.from(e.currentTarget.selectedOptions, (option: HTMLOptionElement) => option.value);
        setFormData(prev => ({ ...prev, studentIds: values }));
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
                <h2 className="text-xl font-bold mb-4">{classToEdit ? 'Editar Clase' : 'Añadir Clase'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Clase/Grupo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Ej: ESO 1ºA" />
                    </div>
                    {/* FIX: Add timetable selection dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plantilla de Horario</label>
                        <select name="timetableId" value={formData.timetableId || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
                            <option value="">-- Sin Horario --</option>
                            {timetables.map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alumnos</label>
                        <p className="text-xs text-gray-500 mb-1">Mantener Ctrl/Cmd para selección múltiple.</p>
                        <select multiple name="studentIds" value={formData.studentIds} onChange={handleStudentIdsChange} className="mt-1 block w-full h-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
                            {allStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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

export default ClassForm;