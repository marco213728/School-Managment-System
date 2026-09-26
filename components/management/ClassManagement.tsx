import React, { useState, useMemo, useContext } from 'react';
import { Class, User, Student, Role, Timetable } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, ArrowLeftIcon, UsersIcon } from '../icons/Icons';
import ClassForm from './ClassForm';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { deleteDocument, saveDocument } from '../../lib/firebase';

interface ClassManagementProps {
    classes: Class[];
    users: User[];
    students: Student[];
    timetables: Timetable[];
    onUpdateClasses: (classes: Class[]) => void;
    onUpdateStudents?: (students: Student[]) => void;
    onBack: () => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ 
    classes, 
    users, 
    students, 
    timetables, 
    onUpdateClasses, 
    onUpdateStudents,
    onBack 
}) => {
    const { user: currentUser } = useContext(UserContext);
    const { institution: currentInstitution } = useContext(InstitutionContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [viewingClassStudents, setViewingClassStudents] = useState<Class | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const timetableMap = useMemo(() => new Map(timetables.map(t => [t.id, t.name])), [timetables]);
    const teacherMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

    // Reliable institution ID resolution
    const effectiveInstitutionId = useMemo(() => {
        return currentUser?.institutionId || currentInstitution?.id || classes[0]?.institutionId || 'uemol';
    }, [currentUser, currentInstitution, classes]);

    const filteredClasses = useMemo(() => {
        if (!searchTerm.trim()) return classes;
        const q = searchTerm.toLowerCase();
        return classes.filter(c => 
            c.name.toLowerCase().includes(q) ||
            (c.gradoCurso && c.gradoCurso.toLowerCase().includes(q)) ||
            (c.letra && c.letra.toLowerCase().includes(q)) ||
            (c.tutorId && (teacherMap.get(c.tutorId) || '').toLowerCase().includes(q))
        );
    }, [classes, searchTerm, teacherMap]);

    const handleAddNew = () => {
        setEditingClass(null);
        setIsModalOpen(true);
    };

    const handleEdit = (cls: Class) => {
        setEditingClass(cls);
        setIsModalOpen(true);
    };

    const handleDelete = async (classId: string) => {
        const cls = classes.find(c => c.id === classId);
        const name = cls?.name || 'esta clase';
        if (window.confirm(`¿Está seguro de que desea eliminar la clase "${name}"? Esta acción borrará la clase y liberará a sus alumnos asignados.`)) {
            // Delete directly from Firestore
            await deleteDocument('classes', classId);
            
            // Update parent classes state
            const updated = classes.filter(c => c.id !== classId);
            onUpdateClasses(updated);

            // Unlink students if onUpdateStudents is provided
            if (onUpdateStudents && students) {
                const updatedStudents = students.map(s => s.classId === classId ? { ...s, classId: '' } : s);
                onUpdateStudents(updatedStudents);
                // Also update unlinked students in Firestore
                students.filter(s => s.classId === classId).forEach(s => {
                    saveDocument('students', s.id, { ...s, classId: '' });
                });
            }
        }
    };

    const handleSave = async (classToSave: Omit<Class, 'id' | 'institutionId'> & { id?: string }) => {
        let savedClass: Class;
        let updatedClasses: Class[];

        if (classToSave.id) {
            // Updating existing class
            savedClass = {
                ...classToSave,
                id: classToSave.id,
                institutionId: effectiveInstitutionId,
                name: classToSave.name.trim(),
                studentIds: classToSave.studentIds || [],
                timetableId: classToSave.timetableId || '',
                tutorId: classToSave.tutorId || '',
                gradoCurso: classToSave.gradoCurso || '',
                letra: classToSave.letra || 'A',
                academicYear: classToSave.academicYear || '2024-2025'
            } as Class;

            updatedClasses = classes.map(c => c.id === savedClass.id ? savedClass : c);
        } else {
            // Creating brand new class
            const newId = `class-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
            savedClass = {
                ...classToSave,
                id: newId,
                institutionId: effectiveInstitutionId,
                name: classToSave.name.trim(),
                studentIds: classToSave.studentIds || [],
                timetableId: classToSave.timetableId || '',
                tutorId: classToSave.tutorId || '',
                gradoCurso: classToSave.gradoCurso || '',
                letra: classToSave.letra || 'A',
                academicYear: classToSave.academicYear || '2024-2025'
            };

            updatedClasses = [...classes, savedClass];
        }

        // 1. Immediately persist to Firestore
        await saveDocument('classes', savedClass.id, savedClass);

        // 2. Synchronize students classId
        if (onUpdateStudents && students) {
            const assignedSet = new Set(savedClass.studentIds);
            const updatedStudents = students.map(s => {
                if (assignedSet.has(s.id)) {
                    return { ...s, classId: savedClass.id };
                } else if (s.classId === savedClass.id && !assignedSet.has(s.id)) {
                    // Removed from class
                    return { ...s, classId: '' };
                }
                return s;
            });
            onUpdateStudents(updatedStudents);
        }

        // 3. Update classes state
        onUpdateClasses(updatedClasses);
        setIsModalOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-800 transition mb-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Volver al Panel de Gestión
                    </button>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span>🏫</span> Gestión de Clases y Paralelos
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Organiza los cursos de la institución, tutores asignados y nóminas de alumnos.
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input 
                        type="text" 
                        placeholder="Buscar por curso, tutor..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        className="text-xs px-3 py-2 border border-slate-300 rounded-lg w-full sm:w-48 focus:ring-2 focus:ring-primary-500"
                    />
                    <button 
                        onClick={handleAddNew} 
                        className="px-4 py-2 bg-primary-600 text-white font-bold text-xs rounded-xl hover:bg-primary-700 transition shadow-md flex items-center gap-1.5 whitespace-nowrap"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Crear Clase
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 text-left">Nombre de la Clase</th>
                            <th className="px-4 py-3 text-left">Grado / Nivel</th>
                            <th className="px-4 py-3 text-left">Tutor de Aula</th>
                            <th className="px-4 py-3 text-left">Horario</th>
                            <th className="px-4 py-3 text-center">Nº Alumnos</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {filteredClasses.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                    No hay clases registradas aún. Haz clic en <strong>"Crear Clase"</strong> para registrar la primera.
                                </td>
                            </tr>
                        ) : (
                            filteredClasses.map(cls => {
                                const tutorName = cls.tutorId ? teacherMap.get(cls.tutorId) : null;
                                const studentCount = cls.studentIds ? cls.studentIds.length : 0;
                                const timetableName = cls.timetableId ? timetableMap.get(cls.timetableId) : null;

                                return (
                                    <tr key={cls.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-bold text-slate-900">{cls.name}</div>
                                            {cls.academicYear && (
                                                <div className="text-[10px] text-slate-400 font-mono">Año: {cls.academicYear}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[11px]">
                                                {cls.gradoCurso || 'General'} {cls.letra ? `(${cls.letra})` : ''}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                            {tutorName ? (
                                                <span className="font-medium text-slate-800 flex items-center gap-1">
                                                    👨‍🏫 {tutorName}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">Sin tutor asignado</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                                            {timetableName || <span className="text-slate-400">Sin plantilla horaria</span>}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <button 
                                                onClick={() => setViewingClassStudents(cls)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-full font-bold text-xs transition"
                                                title="Ver nómina de alumnos"
                                            >
                                                <UsersIcon className="h-3.5 w-3.5" />
                                                <span>{studentCount}</span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right space-x-1">
                                            <button 
                                                onClick={() => handleEdit(cls)} 
                                                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition" 
                                                title="Editar clase"
                                            >
                                                <EditIcon className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(cls.id)} 
                                                className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition" 
                                                title="Eliminar clase"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Quick Students Modal */}
            {viewingClassStudents && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-5 max-w-lg w-full max-h-[80vh] flex flex-col border border-slate-200 animate-scale-in">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div>
                                <h4 className="font-bold text-sm text-slate-800">
                                    Nómina: {viewingClassStudents.name}
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Total: {viewingClassStudents.studentIds.length} estudiante(s) matriculado(s)
                                </p>
                            </div>
                            <button 
                                onClick={() => setViewingClassStudents(null)} 
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="overflow-y-auto divide-y divide-slate-100 my-3 flex-1">
                            {viewingClassStudents.studentIds.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 text-center">
                                    No hay alumnos inscritos en este curso todavía.
                                </p>
                            ) : (
                                viewingClassStudents.studentIds.map((studentId, idx) => {
                                    const std = students.find(s => s.id === studentId);
                                    return (
                                        <div key={studentId} className="py-2 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-slate-400 w-5">{idx + 1}.</span>
                                                <span className="font-semibold text-slate-800">{std?.name || `ID: ${studentId}`}</span>
                                            </div>
                                            <span className="text-[11px] font-mono text-slate-500">{std?.nationalId || '-'}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setViewingClassStudents(null)} 
                                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Creación / Edición */}
            {isModalOpen && (
                <ClassForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    classToEdit={editingClass}
                    allUsers={users}
                    allStudents={students}
                    timetables={timetables}
                />
            )}
        </div>
    );
};

export default ClassManagement;
