import React, { useState, useEffect, useMemo } from 'react';
import { Class, User, Student, Role, Timetable } from '../../types';
import { CloseIcon, SearchIcon } from '../icons/Icons';

interface ClassFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (classData: Omit<Class, 'id' | 'institutionId'> & { id?: string }) => void;
    classToEdit: Class | null;
    allUsers: User[];
    allStudents: Student[];
    timetables: Timetable[];
}

const GRADOS_ECUADOR = [
    'Inicial 1 (3 años)',
    'Inicial 2 (4 años)',
    '1ro EGB (Preparatoria)',
    '2do EGB (Elemental)',
    '3ro EGB (Elemental)',
    '4to EGB (Elemental)',
    '5to EGB (Media)',
    '6to EGB (Media)',
    '7mo EGB (Media)',
    '8vo EGB (Superior)',
    '9no EGB (Superior)',
    '10mo EGB (Superior)',
    '1ro BGU (Bachillerato)',
    '2do BGU (Bachillerato)',
    '3ro BGU (Bachillerato)',
    'Bachillerato Técnico',
    'Otro Nivel'
];

const PARALELOS = ['A', 'B', 'C', 'D', 'E', 'F'];

const ClassForm: React.FC<ClassFormProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    classToEdit, 
    allUsers, 
    allStudents, 
    timetables 
}) => {
    const [formData, setFormData] = useState({
        id: undefined as string | undefined,
        name: '',
        gradoCurso: '',
        letra: 'A',
        tutorId: '',
        academicYear: '2024-2025',
        timetableId: '',
        studentIds: [] as string[],
    });

    const [studentSearch, setStudentSearch] = useState('');

    const teachers = useMemo(() => {
        return allUsers.filter(u => u.role === Role.Teacher || u.role === Role.Vicerrector || u.role === Role.InstitutionAdmin);
    }, [allUsers]);

    useEffect(() => {
        if (classToEdit) {
            setFormData({
                id: classToEdit.id,
                name: classToEdit.name || '',
                gradoCurso: classToEdit.gradoCurso || '',
                letra: classToEdit.letra || 'A',
                tutorId: classToEdit.tutorId || '',
                academicYear: classToEdit.academicYear || '2024-2025',
                timetableId: classToEdit.timetableId || '',
                studentIds: classToEdit.studentIds || [],
            });
        } else {
            setFormData({
                id: undefined,
                name: '',
                gradoCurso: '8vo EGB (Superior)',
                letra: 'A',
                tutorId: '',
                academicYear: '2024-2025',
                timetableId: '',
                studentIds: [],
            });
        }
        setStudentSearch('');
    }, [classToEdit, isOpen]);

    const handleGradoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const grado = e.target.value;
        setFormData(prev => {
            const shortGrado = grado.split('(')[0].trim();
            const autoName = `${shortGrado} Paralelo ${prev.letra}`;
            return {
                ...prev,
                gradoCurso: grado,
                name: prev.name && classToEdit ? prev.name : autoName
            };
        });
    };

    const handleLetraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const letra = e.target.value;
        setFormData(prev => {
            const shortGrado = prev.gradoCurso.split('(')[0].trim();
            const autoName = `${shortGrado || 'Curso'} Paralelo ${letra}`;
            return {
                ...prev,
                letra,
                name: prev.name && classToEdit ? prev.name : autoName
            };
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleStudentSelection = (studentId: string) => {
        setFormData(prev => {
            const exists = prev.studentIds.includes(studentId);
            const nextStudentIds = exists 
                ? prev.studentIds.filter(id => id !== studentId)
                : [...prev.studentIds, studentId];
            return { ...prev, studentIds: nextStudentIds };
        });
    };

    const handleSelectAllFiltered = () => {
        const filteredIds = filteredStudents.map(s => s.id);
        setFormData(prev => {
            const set = new Set([...prev.studentIds, ...filteredIds]);
            return { ...prev, studentIds: Array.from(set) };
        });
    };

    const handleDeselectAll = () => {
        setFormData(prev => ({ ...prev, studentIds: [] }));
    };

    const filteredStudents = useMemo(() => {
        if (!studentSearch.trim()) return allStudents;
        const q = studentSearch.toLowerCase();
        return allStudents.filter(s => 
            s.name.toLowerCase().includes(q) || 
            (s.nationalId && s.nationalId.includes(q))
        );
    }, [allStudents, studentSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Por favor especifique el nombre de la clase o grupo.');
            return;
        }

        // Clean payload guaranteeing no undefined properties
        onSave({
            ...(formData.id ? { id: formData.id } : {}),
            name: formData.name.trim(),
            gradoCurso: formData.gradoCurso || '',
            letra: formData.letra || 'A',
            tutorId: formData.tutorId || '',
            academicYear: formData.academicYear || '2024-2025',
            timetableId: formData.timetableId || '',
            studentIds: formData.studentIds || []
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-center items-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative border border-slate-200 animate-scale-in max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition">
                    <CloseIcon className="h-5 w-5" />
                </button>

                <div className="mb-5 pb-3 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">
                        {classToEdit ? 'Editar Clase / Paralelo' : 'Crear Nueva Clase / Paralelo'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        Configura el grupo de estudiantes, su grado, tutor y plantilla horaria.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Grado y Paralelo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Grado / Nivel Educativo
                            </label>
                            <select 
                                name="gradoCurso" 
                                value={formData.gradoCurso} 
                                onChange={handleGradoChange}
                                className="w-full text-sm px-3 py-2 border border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                {GRADOS_ECUADOR.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Paralelo
                            </label>
                            <select 
                                name="letra" 
                                value={formData.letra} 
                                onChange={handleLetraChange}
                                className="w-full text-sm px-3 py-2 border border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                {PARALELOS.map(p => (
                                    <option key={p} value={p}>Paralelo {p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Nombre Oficial */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Nombre del Grupo / Paralelo <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-xs" 
                            placeholder="Ej: 10mo EGB Paralelo A" 
                        />
                    </div>

                    {/* Tutor y Horario */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Docente Tutor / Guía
                            </label>
                            <select 
                                name="tutorId" 
                                value={formData.tutorId} 
                                onChange={handleChange} 
                                className="w-full text-sm px-3 py-2 border border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">-- Sin tutor asignado --</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Plantilla de Horario
                            </label>
                            <select 
                                name="timetableId" 
                                value={formData.timetableId} 
                                onChange={handleChange} 
                                className="w-full text-sm px-3 py-2 border border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">-- Sin Horario Asignado --</option>
                                {timetables.map(tt => (
                                    <option key={tt.id} value={tt.id}>{tt.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Selección de Estudiantes */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Alumnos en este Paralelo ({formData.studentIds.length} asignados)
                                </label>
                                <p className="text-[11px] text-slate-500">
                                    Marca los estudiantes que pertenecen a esta nómina.
                                </p>
                            </div>
                            <div className="flex gap-2 text-xs">
                                <button 
                                    type="button" 
                                    onClick={handleSelectAllFiltered}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold transition"
                                >
                                    Seleccionar visibles
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleDeselectAll}
                                    className="px-2 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded font-semibold transition"
                                >
                                    Limpiar todos
                                </button>
                            </div>
                        </div>

                        {/* Search input for students */}
                        <div className="relative mb-2">
                            <input 
                                type="text"
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                                placeholder="Filtrar por nombre o cédula de estudiante..."
                                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                            />
                            <SearchIcon className="h-4 w-4 text-slate-400 absolute left-2.5 top-2" />
                        </div>

                        {/* Students checkbox list */}
                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg">
                            {filteredStudents.length === 0 ? (
                                <p className="p-3 text-xs text-slate-400 text-center">No se encontraron estudiantes.</p>
                            ) : (
                                filteredStudents.map(student => {
                                    const isSelected = formData.studentIds.includes(student.id);
                                    return (
                                        <div 
                                            key={student.id} 
                                            onClick={() => toggleStudentSelection(student.id)}
                                            className={`flex items-center justify-between p-2 px-3 text-xs cursor-pointer transition ${isSelected ? 'bg-blue-50/70 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected} 
                                                    onChange={() => {}} // handled by parent div
                                                    className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4 pointer-events-none" 
                                                />
                                                <span>{student.name}</span>
                                            </div>
                                            <div className="text-[11px] text-slate-400 font-mono">
                                                {student.nationalId || `ID: ${student.id.substring(0, 8)}`}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition shadow-md"
                        >
                            {classToEdit ? 'Guardar Cambios' : 'Crear Clase'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassForm;
