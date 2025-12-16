
import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Role, User, Class, Student, ScheduleEntry, SupportContact, Subject, TimeSlot, Room, Timetable, AcademicCalendarEvent, StaffAttendanceRecord, Gradebook } from '../types';
import UserManagement from '../components/management/UserManagement';
import InstitutionManagement from '../components/management/InstitutionManagement';
import ClassManagement from '../components/management/ClassManagement';
import ScheduleManagement from '../components/management/ScheduleManagement';
import StudentManagement from '../components/management/StudentManagement';
import CommunicationManagement from '../components/management/CommunicationManagement';
import SupportContactManagement from '../components/management/SupportContactManagement';
import SubjectManagement from '../components/management/SubjectManagement';
import RoomManagement from '../components/management/RoomManagement';
import TimetableManagementComponent from '../components/dece/StudentDeceFile';
import AcademicCalendarManagement from '../components/management/AcademicCalendarManagement';
import StaffAttendanceKiosk from '../components/staff/StaffAttendanceKiosk';
import StaffAttendanceReport from '../components/staff/StaffAttendanceReport';
import BiometricEnrollmentModal from '../components/staff/BiometricEnrollmentModal';
import PromotionWizard from '../components/management/PromotionWizard';
import { FingerPrintIcon, UsersIcon, ClipboardListIcon, CalendarIcon, ManageIcon, GraduationCapIcon } from '../components/icons/Icons';

interface ManagePageProps {
  allUsers: User[];
  allClasses: Class[];
  allStudents: Student[];
  schedule: ScheduleEntry[];
  supportContacts: SupportContact[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  rooms: Room[];
  timetables: Timetable[];
  academicCalendarEvents: AcademicCalendarEvent[];
  staffAttendanceRecords: StaffAttendanceRecord[];
  // Added Gradebooks for promotion logic
  gradebooks?: Gradebook[]; 
  
  onUpdateUsers: (users: User[]) => void;
  onUpdateClasses: (classes: Class[]) => void;
  onUpdateSchedule: (schedule: ScheduleEntry[]) => void;
  onUpdateStudents: (students: Student[]) => void;
  onUpdateSupportContacts: (contacts: SupportContact[]) => void;
  onUpdateSubjects: (subjects: Subject[]) => void;
  onUpdateTimeSlots: (timeSlots: TimeSlot[]) => void;
  onUpdateRooms: (rooms: Room[]) => void;
  onUpdateTimetables: (timetables: Timetable[]) => void;
  onUpdateAcademicCalendarEvents: (events: AcademicCalendarEvent[]) => void;
  onUpdateStaffAttendance: (userId: string, method: 'Biometric' | 'Manual' | 'Facial', location?: { latitude: number; longitude: number; }) => void;
}

interface ManageCardProps {
    title: string;
    children: React.ReactNode;
}

const ManageCard: React.FC<ManageCardProps> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>
        {children}
    </div>
);

const ManagePage: React.FC<ManagePageProps> = ({ 
  allUsers, allClasses, allStudents, schedule, supportContacts, subjects, timeSlots, rooms, timetables, academicCalendarEvents,
  staffAttendanceRecords, gradebooks = [],
  onUpdateUsers, onUpdateClasses, onUpdateSchedule, onUpdateStudents, onUpdateSupportContacts, onUpdateSubjects, onUpdateTimeSlots, onUpdateRooms, onUpdateTimetables, onUpdateAcademicCalendarEvents,
  onUpdateStaffAttendance,
}) => {
    const { user: currentUser } = useContext(UserContext);
    const [view, setView] = useState<'dashboard' | 'users' | 'classes' | 'schedule' | 'students' | 'communication' | 'support' | 'subjects' | 'rooms' | 'timetables' | 'calendar' | 'staff_control'>('dashboard');
    
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
    const [userToEnroll, setUserToEnroll] = useState<User | null>(null);
    const [isPromotionOpen, setIsPromotionOpen] = useState(false);

    const institutionData = useMemo(() => {
        if (!currentUser?.institutionId) {
            return { users: [], classes: [], students: [], schedule: [], supportContacts: [], subjects: [], timeSlots: [], rooms: [], timetables: [], academicCalendarEvents: [] };
        }
        const institutionId = currentUser.institutionId;
        
        return {
            users: allUsers.filter(u => u.institutionId === institutionId),
            classes: allClasses.filter(c => c.institutionId === institutionId),
            students: allStudents.filter(s => s.institutionId === institutionId),
            schedule: schedule,
            supportContacts: supportContacts.filter(sc => sc.institutionId === institutionId),
            subjects: subjects.filter(s => s.institutionId === institutionId),
            timeSlots: timeSlots,
            rooms: rooms.filter(r => r.institutionId === institutionId),
            timetables: timetables.filter(t => t.institutionId === institutionId),
            academicCalendarEvents: academicCalendarEvents.filter(e => e.institutionId === institutionId),
        };
    }, [currentUser, allUsers, allClasses, allStudents, schedule, supportContacts, subjects, timeSlots, rooms, timetables, academicCalendarEvents]);

    if (!currentUser || ![Role.InstitutionAdmin, Role.InspectorGeneral].includes(currentUser.role)) {
        return <div className="bg-white p-6 rounded-xl shadow-md"><h2 className="text-xl font-bold text-slate-800 mb-4">Gestión del Centro</h2><p>No tiene los permisos necesarios para acceder a esta sección.</p></div>
    }

    const handleEnrollBiometric = (success: boolean) => {
        if (success && userToEnroll) {
            const updatedUsers = allUsers.map(u => u.id === userToEnroll.id ? { ...u, biometricRegistered: true } : u);
            onUpdateUsers(updatedUsers);
        }
        setIsEnrollmentOpen(false);
    };

    const startEnrollment = (user: User) => {
        setUserToEnroll(user);
        setIsEnrollmentOpen(true);
    };
    
    const handleUpdateInstitutionUsers = (updatedInstUsers: User[]) => { const otherUsers = allUsers.filter(u => u.institutionId !== currentUser.institutionId); onUpdateUsers([...otherUsers, ...updatedInstUsers]); };
    const handleUpdateInstitutionClasses = (updatedInstClasses: Class[]) => { const otherClasses = allClasses.filter(c => c.institutionId !== currentUser.institutionId); onUpdateClasses([...otherClasses, ...updatedInstClasses]); };
    const handleUpdateInstitutionSchedule = (updatedInstSchedule: ScheduleEntry[]) => { onUpdateSchedule(updatedInstSchedule); };
    const handleUpdateInstitutionStudents = (updatedInstStudents: Student[]) => { const otherStudents = allStudents.filter(s => s.institutionId !== currentUser.institutionId); onUpdateStudents([...otherStudents, ...updatedInstStudents]); };
    const handleUpdateInstitutionSupportContacts = (updatedInstContacts: SupportContact[]) => { const otherContacts = supportContacts.filter(sc => sc.institutionId !== currentUser.institutionId); onUpdateSupportContacts([...otherContacts, ...updatedInstContacts]); }
    const handleUpdateInstitutionSubjects = (updatedInstSubjects: Subject[]) => { const otherSubjects = subjects.filter(s => s.institutionId !== currentUser.institutionId); onUpdateSubjects([...otherSubjects, ...updatedInstSubjects]); }
    const handleUpdateInstitutionTimeSlots = (updatedInstTimeSlots: TimeSlot[]) => { const updatedGlobalTimeSlots = timeSlots.filter(ts => ts.institutionId !== currentUser.institutionId); onUpdateTimeSlots([...updatedGlobalTimeSlots, ...updatedInstTimeSlots]); }
    const handleUpdateInstitutionRooms = (updatedInstRooms: Room[]) => { const otherRooms = rooms.filter(r => r.institutionId !== currentUser.institutionId); onUpdateRooms([...otherRooms, ...updatedInstRooms]); }
    const handleUpdateInstitutionTimetables = (updatedInstTimetables: Timetable[]) => { const otherTimetables = timetables.filter(t => t.institutionId !== currentUser.institutionId); onUpdateTimetables([...otherTimetables, ...updatedInstTimetables]); };
    const handleUpdateInstitutionAcademicCalendarEvents = (updatedEvents: AcademicCalendarEvent[]) => { const otherEvents = academicCalendarEvents.filter(e => e.institutionId !== currentUser.institutionId); onUpdateAcademicCalendarEvents([...otherEvents, ...updatedEvents]); };

    const renderDashboard = () => (
      <div className="space-y-6">
        {currentUser?.role === Role.InstitutionAdmin && <InstitutionManagement />}
        
        <div className="border-b pb-4">
            <h3 className="text-xl font-bold text-slate-800">Módulos de Gestión</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ManageCard title="Control de Personal (Biometría)"><p className="text-slate-600">Registro de asistencia docente y gestión de perfiles biométricos.</p><button onClick={() => setView('staff_control')} className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><FingerPrintIcon className="h-5 w-5" /> Acceder al Módulo</button></ManageCard>
             <ManageCard title="Gestionar Usuarios"><p className="text-slate-600">Añadir, editar y consultar los perfiles de todo el personal.</p><button onClick={() => setView('users')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Ir a Gestión de Usuarios</button></ManageCard>
             <ManageCard title="Gestionar Alumnos"><p className="text-slate-600">Añadir, editar y consultar los perfiles de los alumnos y sus familiares.</p><button onClick={() => setView('students')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Ir a Gestión de Alumnos</button></ManageCard>
        </div>

        <div className="border-b pb-4 pt-6">
            <h3 className="text-xl font-bold text-slate-800">Configuración Académica</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <ManageCard title="Ciclo Lectivo y Promoción"><p className="text-slate-600">Gestionar cambio de año, matriculación y promoción de estudiantes.</p><button onClick={() => setIsPromotionOpen(true)} className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700"><GraduationCapIcon className="h-5 w-5" /> Asistente de Promoción</button></ManageCard>
             <ManageCard title="Plantillas de Horario y Franjas"><p className="text-slate-600">Definir las jornadas y las horas de clase (franjas horarias).</p><button onClick={() => setView('timetables')} className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><CalendarIcon className="h-5 w-5" /> Configurar Plantillas</button></ManageCard>
             <ManageCard title="Asignaturas"><p className="text-slate-600">Crear y editar las asignaturas y asignarlas a los profesores.</p><button onClick={() => setView('subjects')} className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><ClipboardListIcon className="h-5 w-5" /> Gestionar Asignaturas</button></ManageCard>
             <ManageCard title="Aulas y Espacios"><p className="text-slate-600">Administrar las aulas, laboratorios y otros espacios físicos.</p><button onClick={() => setView('rooms')} className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><UsersIcon className="h-5 w-5" /> Gestionar Aulas</button></ManageCard>
             <ManageCard title="Gestionar Clases (Grupos)"><p className="text-slate-600">Crear grupos de alumnos y asignarles una plantilla de horario.</p><button onClick={() => setView('classes')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Gestionar Clases</button></ManageCard>
             <ManageCard title="Configurar Horario Semanal"><p className="text-slate-600">Asignar asignaturas a las clases en el calendario semanal.</p><button onClick={() => setView('schedule')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Configurar Horarios</button></ManageCard>
        </div>
      </div>
    );

    const renderStaffControl = () => (
        <div className="space-y-8">
            {/* Added: Kiosk for Testing */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Terminal de Asistencia (Modo Prueba)</h3>
                <p className="text-sm text-slate-600 mb-4">Utilice este terminal para simular el registro de asistencia como cualquier usuario de la institución.</p>
                <StaffAttendanceKiosk 
                    users={institutionData.users}
                    onRecordAttendance={onUpdateStaffAttendance}
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Inscripción Biométrica del Personal</h3>
                <p className="text-sm text-slate-500 mb-4">Seleccione un miembro del personal para registrar o actualizar su huella dactilar.</p>
                <ul className="divide-y max-h-80 overflow-y-auto border rounded-md">
                    {institutionData.users.filter(u => u.role !== Role.Parent && u.role !== Role.Student).map(staff => (
                        <li key={staff.id} className="p-3 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{staff.name}</p>
                                <p className="text-xs text-slate-500">{staff.role}</p>
                            </div>
                            {staff.biometricRegistered ? (
                                <span className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">Registrado</span>
                            ) : (
                                <button onClick={() => startEnrollment(staff)} className="text-sm font-semibold text-primary-600 hover:underline">Inscribir</button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Reporte Administrativo de Asistencia</h3>
                <StaffAttendanceReport 
                    records={staffAttendanceRecords}
                    users={institutionData.users}
                />
            </div>
        </div>
    );
    
    const renderView = () => {
         switch (view) {
            case 'staff_control': return <div><button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">&larr; Volver</button>{renderStaffControl()}</div>;
            case 'users': return <UserManagement users={institutionData.users} allClasses={institutionData.classes} allStudents={institutionData.students} onUpdateUsers={handleUpdateInstitutionUsers} />;
            case 'classes': return <ClassManagement classes={institutionData.classes} users={institutionData.users} students={institutionData.students} timetables={institutionData.timetables} onUpdateClasses={handleUpdateInstitutionClasses} onBack={() => setView('dashboard')} />;
            case 'schedule': return <ScheduleManagement schedule={schedule} classes={institutionData.classes} timeSlots={timeSlots} subjects={institutionData.subjects} rooms={institutionData.rooms} timetables={institutionData.timetables} users={institutionData.users} onUpdateSchedule={handleUpdateInstitutionSchedule} onBack={() => setView('dashboard')} />;
            case 'students': return <StudentManagement students={institutionData.students} users={institutionData.users} classes={institutionData.classes} onUpdateStudents={handleUpdateInstitutionStudents} onUpdateUsers={handleUpdateInstitutionUsers} onBack={() => setView('dashboard')} />;
            case 'timetables': return <TimetableManagementComponent timetables={institutionData.timetables} timeSlots={institutionData.timeSlots} onUpdateTimetables={handleUpdateInstitutionTimetables} onUpdateTimeSlots={handleUpdateInstitutionTimeSlots} institutionId={currentUser.institutionId!} onBack={() => setView('dashboard')} />;
            case 'subjects': return <SubjectManagement subjects={institutionData.subjects} users={institutionData.users} onUpdateSubjects={handleUpdateInstitutionSubjects} onBack={() => setView('dashboard')} />;
            case 'rooms': return <RoomManagement rooms={institutionData.rooms} onUpdateRooms={handleUpdateInstitutionRooms} onBack={() => setView('dashboard')} />;
            default: return renderDashboard();
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestión del Centro</h2>
            {renderView()}
            {userToEnroll && (
                <BiometricEnrollmentModal 
                    isOpen={isEnrollmentOpen}
                    onClose={() => setIsEnrollmentOpen(false)}
                    onEnroll={handleEnrollBiometric}
                    userName={userToEnroll.name}
                />
            )}
            {isPromotionOpen && (
                <PromotionWizard 
                    classes={institutionData.classes}
                    students={institutionData.students}
                    gradebooks={gradebooks}
                    onUpdateClasses={handleUpdateInstitutionClasses}
                    onUpdateStudents={handleUpdateInstitutionStudents}
                    onClose={() => setIsPromotionOpen(false)}
                />
            )}
        </div>
    );
};

export default ManagePage;
