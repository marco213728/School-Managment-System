import React, { useState, useMemo } from 'react';
// FIX: Add Timetable to imports to support new timetables prop
import { Class, User, Student, Role, Timetable } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, ArrowLeftIcon } from '../icons/Icons';
import ClassForm from './ClassForm';

interface ClassManagementProps {
    classes: Class[];
    users: User[];
    students: Student[];
    // FIX: Add timetables prop to be passed down to ClassForm
    timetables: Timetable[];
    onUpdateClasses: (classes: Class[]) => void;
    onBack: () => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ classes, users, students, timetables, onUpdateClasses, onBack }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const timetableMap = useMemo(() => new Map(timetables.map(t => [t.id, t.name])), [timetables]);

    const handleAddNew = () => {
        setEditingClass(null);
        setIsModalOpen(true);
    };

    const handleEdit = (cls: Class) => {
        setEditingClass(cls);
        setIsModalOpen(true);
    };

    const handleDelete = (classId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta clase?')) {
            onUpdateClasses(classes.filter(c => c.id !== classId));
        }
    };

    const handleSave = (classToSave: Omit<Class, 'id' | 'institutionId'> & { id?: string }) => {
        if (classToSave.id) {
            onUpdateClasses(classes.map(c => c.id === classToSave.id ? { ...c, ...classToSave } as Class : c));
        } else {
            const newClass: Class = {
                ...classToSave,
                id: `class-${Date.now()}`,
                institutionId: classes[0]?.institutionId || '', // Assume same institution
            };
            onUpdateClasses([...classes, newClass]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a Gestión del Centro
            </button>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Gestionar Clases (Grupos de Alumnos)</h3>
                <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    <PlusIcon className="h-5 w-5" />
                    Añadir Clase
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Grupo</th>
                            {/* FIX: Add Timetable column header */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº de Alumnos</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {classes.map(cls => (
                            <tr key={cls.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                                {/* FIX: Display timetable name */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.timetableId ? timetableMap.get(cls.timetableId) : 'Sin horario'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.studentIds.length}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(cls)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100"><EditIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleDelete(cls.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <ClassForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    classToEdit={editingClass}
                    allUsers={users}
                    allStudents={students}
                    // FIX: Pass timetables prop to ClassForm
                    timetables={timetables}
                />
            )}
        </div>
    );
};

export default ClassManagement;