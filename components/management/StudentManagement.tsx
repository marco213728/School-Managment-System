import React, { useState, useMemo } from 'react';
import { Student, User, Class, Role, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../icons/Icons';
import StudentForm from './StudentForm';
import StudentProfileCard from '../student/StudentProfileCard';

interface StudentManagementProps {
    students: Student[];
    users: User[];
    classes: Class[];
    onUpdateStudents: (students: Student[]) => void;
    onUpdateUsers: (users: User[]) => void;
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

const StudentManagement: React.FC<StudentManagementProps> = ({ students, users, classes, onUpdateStudents, onUpdateUsers, onBack, showBackButton = true, schedule, subjects, timeSlots, rooms, timetables, viccInterventions, onUpdateViccInterventions }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const classMap = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
    const parentMap = useMemo(() => new Map(users.filter(u => u.role === Role.Parent).map(p => [p.id, p.name])), [users]);

    const filteredStudents = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return students.filter(student =>
            student.name.toLowerCase().includes(lowercasedTerm) ||
            (classMap.get(student.classId) || '').toLowerCase().includes(lowercasedTerm) ||
            (parentMap.get(student.parentId) || '').toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, students, classMap, parentMap]);

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

    const handleDelete = (studentId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar a este alumno? Esta acción también puede afectar al familiar asociado.')) {
            const studentToDelete = students.find(s => s.id === studentId);
            onUpdateStudents(students.filter(s => s.id !== studentId));
            // Also remove parent if they have no other children (simplified logic for prototype)
            if (studentToDelete) {
                onUpdateUsers(users.filter(u => u.id !== studentToDelete.parentId));
            }
        }
    };

    const handleSave = (studentData: Student, parentData: User) => {
        if (studentData.id) { // Editing
            onUpdateStudents(students.map(s => s.id === studentData.id ? studentData : s));
            onUpdateUsers(users.map(u => u.id === parentData.id ? parentData : u));
        } else { // Creating
            onUpdateStudents([...students, studentData]);
            onUpdateUsers([...users, parentData]);
        }
        setIsFormOpen(false);
    };
    
    const handleProfileSave = (updatedStudents: Student[]) => {
        onUpdateStudents(updatedStudents);
    }
    
     const handleUserUpdate = (updatedUsers: User[]) => {
        onUpdateUsers(updatedUsers);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            {showBackButton && onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                    &larr; Volver a Gestión del Centro
                </button>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-gray-700">Gestionar Alumnos</h3>
                 <div className="relative w-full md:w-auto">
                    <input 
                        type="text"
                        placeholder="Buscar por nombre, clase, familiar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    <PlusIcon className="h-5 w-5" />
                    Añadir Alumno
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Alumno</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clase</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Familiar Principal</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map(student => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full object-cover" src={student.photoUrl || `https://placehold.co/200x200/cccccc/333333?text=${student.name.charAt(0)}`} alt="Foto" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classMap.get(student.classId) || 'Sin clase'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parentMap.get(student.parentId) || 'No asignado'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                     <button onClick={() => handleView(student)} className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-green-100" title="Ver Ficha">👁️</button>
                                    <button onClick={() => handleEdit(student)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100" title="Editar"><EditIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100" title="Eliminar"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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