import React, { useContext, useState, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Role, Student, User, Class, HealthRecord, MedicalVisit, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention, Intervention } from '../types';
import StudentProfileCard from '../components/student/StudentProfileCard';
import { SearchIcon } from '../components/icons/Icons';

interface HealthPageProps {
    students: Student[];
    onUpdateStudents: (students: Student[]) => void;
    users: User[];
    classes: Class[];
    healthRecords: HealthRecord[];
    onUpdateHealthRecords: (records: HealthRecord[]) => void;
    medicalVisits: MedicalVisit[];
    onUpdateMedicalVisits: (visits: MedicalVisit[]) => void;
    schedule: ScheduleEntry[];
    subjects: Subject[];
    timeSlots: TimeSlot[];
    rooms: Room[];
    timetables: Timetable[];
    viccInterventions: ViccIntervention[];
    onUpdateViccInterventions: (interventions: ViccIntervention[]) => void;
    interventions?: Intervention[];
    onUpdateInterventions?: (interventions: Intervention[]) => void;
}

const HealthPage: React.FC<HealthPageProps> = ({ 
    students, 
    onUpdateStudents, 
    users, 
    classes, 
    healthRecords, 
    onUpdateHealthRecords, 
    medicalVisits, 
    onUpdateMedicalVisits, 
    schedule, 
    subjects, 
    timeSlots, 
    rooms, 
    timetables, 
    viccInterventions, 
    onUpdateViccInterventions,
    interventions = [],
    onUpdateInterventions
}) => {
    const { user } = useContext(UserContext);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const authorizedRoles = [Role.InstitutionAdmin, Role.HealthProfessional, Role.SuperAdmin, Role.Rector, Role.Vicerrector];
    const effectiveInstitutionId = user?.institutionId || 'uemol';

    const institutionStudents = useMemo(() => students.filter(s => !s.institutionId || s.institutionId === effectiveInstitutionId), [students, effectiveInstitutionId]);
    const institutionClasses = useMemo(() => classes.filter(c => !c.institutionId || c.institutionId === effectiveInstitutionId), [classes, effectiveInstitutionId]);

    const studentsWithClass = useMemo(() => institutionStudents.map(student => {
        const classInfo = institutionClasses.find(c => c.id === student.classId);
        const hasHealthRecord = healthRecords.some(hr => hr.studentId === student.id);
        const visitCount = medicalVisits.filter(mv => mv.studentId === student.id).length;
        return { 
            ...student, 
            className: classInfo?.name || 'Sin clase asignada',
            hasHealthRecord,
            visitCount
        };
    }), [institutionStudents, institutionClasses, healthRecords, medicalVisits]);

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return studentsWithClass;
        const term = searchTerm.toLowerCase();
        return studentsWithClass.filter(student => 
            student && (
                (student.name || '').toLowerCase().includes(term) ||
                (student.className && student.className.toLowerCase().includes(term))
            )
        );
    }, [searchTerm, studentsWithClass]);

    if (!user || !authorizedRoles.includes(user.role)) {
        return (
             <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-bold text-gray-800 mb-4">Módulo de Salud Escolar</h2>
                <p>No tiene los permisos necesarios para acceder a esta sección.</p>
             </div>
        )
    }
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Módulo de Salud Escolar y Gestión Médica</h2>
             <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Seleccionar Estudiante para ver Ficha Médica</h3>
                <div className="relative mb-4">
                     <input 
                        type="text"
                        placeholder="Buscar estudiante por nombre o grado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                            <li key={student.id} onClick={() => setSelectedStudentId(student.id)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">{student.name}</p>
                                    <p className="text-sm text-gray-500">{student.className}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {student.hasHealthRecord ? (
                                        <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">Ficha Activa</span>
                                    ) : (
                                        <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">Sin Ficha</span>
                                    )}
                                    {student.visitCount > 0 && (
                                        <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">{student.visitCount} visitas</span>
                                    )}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-gray-500">No se encontraron estudiantes.</li>
                    )}
                </ul>
            </div>

             {selectedStudentId && (
                <StudentProfileCard 
                    studentId={selectedStudentId} 
                    onClose={() => setSelectedStudentId(null)}
                    isEditable={true}
                    initialTab='health'
                    allStudents={students}
                    onUpdateStudents={onUpdateStudents}
                    allUsers={users}
                    allClasses={classes}
                    allHealthRecords={healthRecords}
                    onUpdateHealthRecords={onUpdateHealthRecords}
                    allMedicalVisits={medicalVisits}
                    onUpdateMedicalVisits={onUpdateMedicalVisits}
                    allInterventions={interventions}
                    onUpdateInterventions={onUpdateInterventions}
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

export default HealthPage;