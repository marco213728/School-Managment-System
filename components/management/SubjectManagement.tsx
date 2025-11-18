import React, { useState, useMemo } from 'react';
import { Subject, User, Role } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, ArrowLeftIcon } from '../icons/Icons';
import SubjectForm from './SubjectForm';

interface SubjectManagementProps {
    subjects: Subject[];
    users: User[];
    onUpdateSubjects: (subjects: Subject[]) => void;
    onBack: () => void;
}

const SubjectManagement: React.FC<SubjectManagementProps> = ({ subjects, users, onUpdateSubjects, onBack }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());

    const teacherMap = useMemo(() => new Map(users.filter(u => u.role === Role.Teacher).map(t => [t.id, t.name])), [users]);

    const groupedSubjects = useMemo(() => {
        const groups = subjects.reduce((acc, subject) => {
            const area = subject.areaOfKnowledge;
            if (!acc[area]) {
                acc[area] = [];
            }
            acc[area].push(subject);
            return acc;
        }, {} as Record<string, Subject[]>);

        // Set all areas to be expanded by default
        setExpandedAreas(new Set(Object.keys(groups)));

        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [subjects]);

    const handleToggleArea = (area: string) => {
        setExpandedAreas(prev => {
            const newSet = new Set(prev);
            if (newSet.has(area)) {
                newSet.delete(area);
            } else {
                newSet.add(area);
            }
            return newSet;
        });
    };
    
    const handleAddNew = () => {
        setEditingSubject(null);
        setIsModalOpen(true);
    };

    const handleEdit = (subject: Subject) => {
        setEditingSubject(subject);
        setIsModalOpen(true);
    };

    const handleDelete = (subjectId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta asignatura?')) {
            onUpdateSubjects(subjects.filter(s => s.id !== subjectId));
        }
    };

    const handleSave = (subjectToSave: Omit<Subject, 'id' | 'institutionId'> & { id?: string }) => {
        if (subjectToSave.id) {
            onUpdateSubjects(subjects.map(s => s.id === subjectToSave.id ? { ...s, ...subjectToSave } as Subject : s));
        } else {
            const newSubject: Subject = {
                ...subjectToSave,
                id: `subj-${Date.now()}`,
                institutionId: subjects[0]?.institutionId || '',
            } as Subject;
            onUpdateSubjects([...subjects, newSubject]);
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
                <h3 className="text-lg font-semibold text-gray-700">Gestionar Asignaturas</h3>
                <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    <PlusIcon className="h-5 w-5" />
                    Añadir Asignatura
                </button>
            </div>
            
            <div className="space-y-4">
                {groupedSubjects.map(([area, areaSubjects]) => (
                    <div key={area} className="border rounded-lg">
                        <button onClick={() => handleToggleArea(area)} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100">
                            <h4 className="font-bold text-gray-800">{area} ({areaSubjects.length})</h4>
                            <svg className={`h-5 w-5 transform transition-transform ${expandedAreas.has(area) ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {expandedAreas.has(area) && (
                            <div className="overflow-x-auto p-2">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-white">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Horas Sem.</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {areaSubjects.map(subject => (
                                            <tr key={subject.id}>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{teacherMap.get(subject.teacherId) || 'No asignado'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{subject.level}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{subject.maxWeeklyHours || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{subject.isModule ? 'Sí' : 'No'}</td>
                                                <td className="px-4 py-3 text-right text-sm font-medium">
                                                    <button onClick={() => handleEdit(subject)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100"><EditIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => handleDelete(subject.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <SubjectForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    subjectToEdit={editingSubject}
                    allUsers={users}
                />
            )}
        </div>
    );
};

export default SubjectManagement;