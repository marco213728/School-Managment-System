import React, { useState, useMemo, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
// FIX: Added missing User import to resolve type error.
import { Role, Student, Class, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention, User } from '../types';
import StudentProfileCard from '../components/student/StudentProfileCard';
import { SearchIcon } from '../components/icons/Icons';

interface ViceRectoratePageProps {
    students: Student[];
    onUpdateStudents: (students: Student[]) => void;
    users: User[];
    classes: Class[];
    schedule: ScheduleEntry[];
    subjects: Subject[];
    timeSlots: TimeSlot[];
    rooms: Room[];
    timetables: Timetable[];
    viccInterventions: ViccIntervention[];
    onUpdateViccInterventions: (interventions: ViccIntervention[]) => void;
}

const StudentSelector: React.FC<{ students: (Student & { className: string })[], onSelectStudent: (studentId: string) => void, title: string }> = ({ students, onSelectStudent, title }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, students]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="relative mb-4">
                <input type="text" placeholder="Buscar estudiante por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
            </div>
            <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredStudents.map(student => (
                    <li key={student.id} onClick={() => onSelectStudent(student.id)} className="p-4 hover:bg-gray-50 cursor-pointer">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.className}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Card: React.FC<{ title: string; description: string; buttonText: string; onClick?: () => void; disabled?: boolean; }> = ({ title, description, buttonText, onClick, disabled }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
        <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <button onClick={onClick} disabled={disabled} className={`mt-4 w-full text-left px-4 py-2 font-semibold rounded-md ${disabled ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
            {buttonText}
        </button>
    </div>
);

const ViceRectoratePage: React.FC<ViceRectoratePageProps> = (props) => {
    const { user } = useContext(UserContext);
    const [view, setView] = useState<'dashboard' | 'student-list'>('dashboard');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const institutionStudents = useMemo(() => props.students.filter(s => s.institutionId === user?.institutionId), [props.students, user]);
    const institutionClasses = useMemo(() => props.classes.filter(c => c.institutionId === user?.institutionId), [props.classes, user]);

    const studentsWithClass = useMemo(() => institutionStudents.map(student => {
        const classInfo = institutionClasses.find(c => c.id === student.classId);
        return { ...student, className: classInfo?.name || 'Sin clase asignada' };
    }).sort((a, b) => a.name.localeCompare(b.name)), [institutionStudents, institutionClasses]);

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudentId(studentId);
        setView('dashboard'); // Go back to dashboard view to allow modal to overlay it
    };

    const renderContent = () => {
        if (view === 'student-list') {
            return <StudentSelector students={studentsWithClass} onSelectStudent={handleSelectStudent} title="Seleccionar Estudiante para Seguimiento" />;
        }

        return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card 
                    title="Gestión Curricular y Pedagógica"
                    description="Liderar los procesos académicos, la implementación del currículo y la supervisión de la evaluación."
                    buttonText="Gestionar Currículo"
                    disabled
                />
                <Card 
                    title="Rendimiento y Apoyo Estudiantil"
                    description="Realizar seguimiento del progreso de los estudiantes, identificar necesidades y coordinar programas de intervención académica."
                    buttonText="Ver Rendimiento"
                    onClick={() => setView('student-list')}
                />
                <Card 
                    title="Coordinación y Planificación Institucional"
                    description="Asegurar la coherencia interna y la función de gestión, participando en la construcción de los instrumentos de gestión escolar."
                    buttonText="Planificar"
                    disabled
                />
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-gray-800">Módulo Vicerrectorado</h2>
                {view !== 'dashboard' && (
                    <button onClick={() => setView('dashboard')} className="text-sm font-semibold text-primary-600 hover:underline">
                        &larr; Volver al Dashboard
                    </button>
                )}
            </div>

            {renderContent()}

            {selectedStudentId && (
                <StudentProfileCard
                    studentId={selectedStudentId}
                    onClose={() => setSelectedStudentId(null)}
                    isEditable={true}
                    initialTab='vicerrectorate'
                    {...props}
                />
            )}
        </div>
    );
};

export default ViceRectoratePage;