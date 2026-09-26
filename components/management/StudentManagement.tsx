import React, { useState, useMemo, useContext } from 'react';
import { Student, User, Class, Role, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, UsersIcon } from '../icons/Icons';
import StudentForm from './StudentForm';
import StudentProfileCard from '../student/StudentProfileCard';
import StudentImportModal from './StudentImportModal';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { deleteDocument, saveDocument } from '../../lib/firebase';

interface StudentManagementProps {
    students: Student[];
    users: User[];
    classes: Class[];
    onUpdateStudents: (students: Student[]) => void;
    onUpdateUsers: (users: User[]) => void;
    onUpdateClasses?: (classes: Class[]) => void;
    onBack?: () => void;
    showBackButton?: boolean;
    schedule?: ScheduleEntry[];
    subjects?: Subject[];
    timeSlots?: TimeSlot[];
    rooms?: Room[];
    timetables?: Timetable[];
    viccInterventions?: ViccIntervention[];
    onUpdateViccInterventions?: (interventions: ViccIntervention[]) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ 
    students, 
    users, 
    classes, 
    onUpdateStudents, 
    onUpdateUsers, 
    onUpdateClasses,
    onBack, 
    showBackButton = true, 
    schedule, 
    subjects, 
    timeSlots, 
    rooms, 
    timetables, 
    viccInterventions, 
    onUpdateViccInterventions 
}) => {
    const { user: currentUser } = useContext(UserContext);
    const { institution: currentInstitution } = useContext(InstitutionContext);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

    const effectiveInstitutionId = useMemo(() => {
        return currentUser?.institutionId || currentInstitution?.id || students[0]?.institutionId || 'uemol';
    }, [currentUser, currentInstitution, students]);

    const classMap = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
    const parentMap = useMemo(() => new Map(users.filter(u => u.role === Role.Parent).map(p => [p.id, p.name])), [users]);

    const filteredStudents = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return students.filter(student => {
            const matchesClass = selectedClassFilter === 'all' || student.classId === selectedClassFilter;
            const matchesSearch = 
                student.name.toLowerCase().includes(lowercasedTerm) ||
                (student.nationalId && student.nationalId.includes(lowercasedTerm)) ||
                (classMap.get(student.classId) || '').toLowerCase().includes(lowercasedTerm) ||
                (parentMap.get(student.parentId) || '').toLowerCase().includes(lowercasedTerm);
            return matchesClass && matchesSearch;
        });
    }, [searchTerm, selectedClassFilter, students, classMap, parentMap]);

    const handleAddNew = () => {
        setSelectedStudent(null);
        setIsFormOpen(true);
    };

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setIsFormOpen(true);
    };

    const handleView = (student: Student) => {
        setSelectedStudent(student);
        setIsProfileOpen(true);
    };

    const handleDelete = async (studentId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar a este alumno? Esta acción también eliminará el registro de Firestore.')) {
            const studentToDelete = students.find(s => s.id === studentId);
            
            // Delete from Firestore
            await deleteDocument('students', studentId);

            // Update local state
            const updated = students.filter(s => s.id !== studentId);
            onUpdateStudents(updated);

            // Unlink from class studentIds if assigned
            if (studentToDelete?.classId && onUpdateClasses) {
                const targetClass = classes.find(c => c.id === studentToDelete.classId);
                if (targetClass) {
                    const updatedClass = {
                        ...targetClass,
                        studentIds: targetClass.studentIds.filter(id => id !== studentId)
                    };
                    saveDocument('classes', updatedClass.id, updatedClass);
                    onUpdateClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
                }
            }

            // Remove parent if orphan
            if (studentToDelete?.parentId) {
                const otherChildren = students.filter(s => s.id !== studentId && s.parentId === studentToDelete.parentId);
                if (otherChildren.length === 0) {
                    await deleteDocument('users', studentToDelete.parentId);
                    onUpdateUsers(users.filter(u => u.id !== studentToDelete.parentId));
                }
            }
        }
    };

    const handleSave = async (studentData: Student, parentData: User) => {
        const studentWithInst: Student = {
            ...studentData,
            institutionId: effectiveInstitutionId
        };
        const parentWithInst: User = {
            ...parentData,
            institutionId: effectiveInstitutionId
        };

        if (studentWithInst.id) { // Editing
            onUpdateStudents(students.map(s => s.id === studentWithInst.id ? studentWithInst : s));
            onUpdateUsers(users.map(u => u.id === parentWithInst.id ? parentWithInst : u));
        } else { // Creating
            const newId = `std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
            studentWithInst.id = newId;
            onUpdateStudents([...students, studentWithInst]);
            onUpdateUsers([...users, parentWithInst]);
        }

        // Save to Firestore
        await saveDocument('students', studentWithInst.id, studentWithInst);
        await saveDocument('users', parentWithInst.id, parentWithInst);

        // Update class studentIds
        if (studentWithInst.classId && onUpdateClasses) {
            const cls = classes.find(c => c.id === studentWithInst.classId);
            if (cls && !cls.studentIds.includes(studentWithInst.id)) {
                const updatedCls = { ...cls, studentIds: [...cls.studentIds, studentWithInst.id] };
                await saveDocument('classes', updatedCls.id, updatedCls);
                onUpdateClasses(classes.map(c => c.id === updatedCls.id ? updatedCls : c));
            }
        }

        setIsFormOpen(false);
    };
    
    const handleProfileSave = (updatedStudents: Student[]) => {
        onUpdateStudents(updatedStudents);
        updatedStudents.forEach(s => saveDocument('students', s.id, s));
    };
    
    const handleUserUpdate = (updatedUsers: User[]) => {
        onUpdateUsers(updatedUsers);
        updatedUsers.forEach(u => saveDocument('users', u.id, u));
    };

    const handleImportSuccess = (newStudents: Student[], newParents: User[], updatedClasses: Class[]) => {
        onUpdateStudents([...students, ...newStudents]);
        if (newParents.length > 0) {
            onUpdateUsers([...users, ...newParents]);
        }
        if (onUpdateClasses && updatedClasses.length > 0) {
            onUpdateClasses(updatedClasses);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            {showBackButton && onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-800 transition mb-4">
                    &larr; Volver a Gestión del Centro
                </button>
            )}

            {/* Header and Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-4 border-b border-slate-100">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span>🎓</span> Nómina de Estudiantes
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Total: {students.length} estudiante(s) matriculado(s) en la institución.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Filter by class */}
                    <select
                        value={selectedClassFilter}
                        onChange={e => setSelectedClassFilter(e.target.value)}
                        className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Todas las clases ({classes.length})</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* Search */}
                    <div className="relative flex-1 md:w-60">
                        <input 
                            type="text"
                            placeholder="Buscar por nombre, cédula..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <SearchIcon className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>

                    {/* Import Button */}
                    <button 
                        onClick={() => setIsImportOpen(true)} 
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
                        title="Importar lista de alumnos desde Excel (.xlsx) o archivo de texto (.txt / .csv)"
                    >
                        <span>📊</span>
                        <span>Importar Excel / TXT</span>
                    </button>

                    {/* Add Single Student */}
                    <button 
                        onClick={handleAddNew} 
                        className="px-3.5 py-2 bg-primary-600 text-white font-bold text-xs rounded-xl hover:bg-primary-700 transition shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>Añadir Alumno</span>
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 text-left">Nº</th>
                            <th className="px-4 py-3 text-left">Nombre del Alumno</th>
                            <th className="px-4 py-3 text-left">Cédula / ID</th>
                            <th className="px-4 py-3 text-left">Clase / Paralelo</th>
                            <th className="px-4 py-3 text-left">Representante Principal</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                    No se encontraron estudiantes. Puedes añadir alumnos uno a uno o usar el botón <strong>"Importar Excel / TXT"</strong> para cargar listas completas.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student, idx) => (
                                <tr key={student.id} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono">
                                        {student.listNumber || idx + 1}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                <img 
                                                    className="h-8 w-8 rounded-full object-cover border border-slate-200" 
                                                    src={student.photoUrl || `https://placehold.co/200x200/2563eb/white?text=${encodeURIComponent(student.name.charAt(0))}`} 
                                                    alt="Foto" 
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <div className="font-bold text-slate-900">{student.name}</div>
                                                {student.gender && (
                                                    <div className="text-[10px] text-slate-400">{student.gender}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-600">
                                        {student.nationalId || <span className="text-slate-400 italic">No registrada</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[11px]">
                                            {classMap.get(student.classId) || 'Sin clase asignada'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                        {parentMap.get(student.parentId) || <span className="text-slate-400 italic">No asignado</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-1">
                                        <button 
                                            onClick={() => handleView(student)} 
                                            className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition" 
                                            title="Ver Ficha Integral"
                                        >
                                            👁️
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(student)} 
                                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition" 
                                            title="Editar datos"
                                        >
                                            <EditIcon className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(student.id)} 
                                            className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition" 
                                            title="Eliminar"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Importación Masiva Excel / TXT */}
            {isImportOpen && (
                <StudentImportModal
                    isOpen={isImportOpen}
                    onClose={() => setIsImportOpen(false)}
                    classes={classes}
                    existingStudents={students}
                    existingUsers={users}
                    institutionId={effectiveInstitutionId}
                    onImportSuccess={handleImportSuccess}
                />
            )}

            {/* Modal de Formulario Individual */}
            {isFormOpen && (
                <StudentForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                    studentToEdit={selectedStudent}
                    allUsers={users}
                    allClasses={classes}
                />
            )}

            {/* Ficha Integral del Alumno */}
            {isProfileOpen && selectedStudent && (
                <StudentProfileCard
                    studentId={selectedStudent.id}
                    onClose={() => setIsProfileOpen(false)}
                    isEditable={true}
                    allStudents={students}
                    onUpdateStudents={handleProfileSave}
                    allUsers={users}
                    onUpdateUsers={handleUserUpdate}
                    allClasses={classes}
                    schedule={schedule}
                    subjects={subjects}
                    timeSlots={timeSlots}
                    rooms={rooms}
                    timetables={timetables}
                    viccInterventions={viccInterventions}
                    onUpdateViccInterventions={onUpdateViccInterventions}
                />
            )}
        </div>
    );
};

export default StudentManagement;
