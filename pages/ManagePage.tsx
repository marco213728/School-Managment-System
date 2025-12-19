
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
import SchoolStandardsManager from '../components/management/SchoolStandardsManager';
import PeiBuilder from '../components/management/PeiBuilder';
// FIX: Added missing SparklesIcon and PlusIcon imports.
import { FingerPrintIcon, UsersIcon, ClipboardListIcon, CalendarIcon, ManageIcon, GraduationCapIcon, ChartBarIcon, ClipboardDocumentCheckIcon, ChatBubbleIcon, ArchiveBoxIcon, ClockIcon, SparklesIcon, PlusIcon } from '../components/icons/Icons';

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
    description?: string;
    icon?: React.ReactNode;
    onClick: () => void;
    buttonText: string;
    color?: string;
}

const ManageCard: React.FC<ManageCardProps> = ({ title, description, icon, onClick, buttonText, color = "bg-primary-600" }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
            {icon && <div className="p-2 bg-slate-50 rounded-lg text-slate-600">{icon}</div>}
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-slate-600 text-sm mb-6 flex-grow">{description}</p>
        <button 
            onClick={onClick} 
            className={`w-full py-2 ${color} text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
        >
            {buttonText}
        </button>
    </div>
);

const ManagePage: React.FC<ManagePageProps> = ({ 
  allUsers, allClasses, allStudents, schedule, supportContacts, subjects, timeSlots, rooms, timetables, academicCalendarEvents,
  staffAttendanceRecords, gradebooks = [],
  onUpdateUsers, onUpdateClasses, onUpdateSchedule, onUpdateStudents, onUpdateSupportContacts, onUpdateSubjects, onUpdateTimeSlots, onUpdateRooms, onUpdateTimetables, onUpdateAcademicCalendarEvents,
  onUpdateStaffAttendance,
}) => {
    const { user: currentUser } = useContext(UserContext);
    const [view, setView] = useState<'dashboard' | 'users' | 'classes' | 'schedule' | 'students' | 'communication' | 'support' | 'subjects' | 'rooms' | 'timetables' | 'calendar' | 'staff_control' | 'quality_standards' | 'pei_builder'>('dashboard');
    
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

    if (!currentUser || ![Role.InstitutionAdmin, Role.InspectorGeneral, Role.Rector].includes(currentUser.role)) {
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
      <div className="space-y-10 pb-10">
        {currentUser?.role === Role.InstitutionAdmin && <InstitutionManagement />}
        
        {/* SECCIÓN 1: GESTIÓN ESTRATÉGICA */}
        <section>
            <div className="border-b-2 border-indigo-100 pb-3 mb-6">
                <h3 className="text-xl font-black text-indigo-900 flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-indigo-500" />
                    Gobernanza y Estrategia (PEI/Calidad)
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ManageCard 
                    title="Constructor de PEI" 
                    description="Planificación estratégica obligatoria de 5 años. Identidad, FODA, Metas y Mejora." 
                    icon={<ClipboardDocumentCheckIcon className="h-6 w-6"/>}
                    buttonText="Abrir Constructor"
                    color="bg-indigo-600"
                    onClick={() => setView('pei_builder')}
                />
                <ManageCard 
                    title="Gestión de la Calidad" 
                    description="Seguimiento de estándares nacionales y carga de medios de verificación para auditoría." 
                    icon={<ChartBarIcon className="h-6 w-6"/>}
                    buttonText="Ver Estándares"
                    color="bg-primary-600"
                    onClick={() => setView('quality_standards')}
                />
                <ManageCard 
                    title="Biometría de Personal" 
                    description="Control de asistencia docente mediante huella dactilar, rostro o PIN." 
                    icon={<FingerPrintIcon className="h-6 w-6"/>}
                    buttonText="Acceder a Control"
                    color="bg-slate-800"
                    onClick={() => setView('staff_control')}
                />
            </div>
        </section>

        {/* SECCIÓN 2: GESTIÓN ACADÉMICA Y USUARIOS */}
        <section>
            <div className="border-b-2 border-slate-100 pb-3 mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <UsersIcon className="h-6 w-6 text-slate-500" />
                    Población y Gestión Académica
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <ManageCard 
                    title="Gestión de Personal" 
                    description="Administrar perfiles de docentes, personal administrativo y directivos." 
                    icon={<UsersIcon className="h-6 w-6"/>}
                    buttonText="Gestionar Usuarios"
                    onClick={() => setView('users')}
                />
                <ManageCard 
                    title="Gestión de Alumnos" 
                    description="Matriculación, perfiles de estudiantes y registro de representantes legales." 
                    icon={<GraduationCapIcon className="h-6 w-6"/>}
                    buttonText="Gestionar Alumnos"
                    onClick={() => setView('students')}
                />
                <ManageCard 
                    title="Estructura de Clases" 
                    description="Crear y organizar los grupos de alumnos por grado y paralelo." 
                    icon={<ArchiveBoxIcon className="h-6 w-6"/>}
                    buttonText="Gestionar Clases"
                    onClick={() => setView('classes')}
                />
                <ManageCard 
                    title="Malla de Asignaturas" 
                    description="Configurar asignaturas, áreas de conocimiento y asignación docente." 
                    icon={<ClipboardListIcon className="h-6 w-6"/>}
                    buttonText="Gestionar Materias"
                    onClick={() => setView('subjects')}
                />
                 <ManageCard 
                    title="Horarios de Clase" 
                    description="Asignar la carga horaria semanal por asignatura, docente y aula." 
                    icon={<CalendarIcon className="h-6 w-6"/>}
                    buttonText="Configurar Horarios"
                    onClick={() => setView('schedule')}
                />
                <ManageCard 
                    title="Cierre de Ciclo" 
                    description="Paso de año lectivo, promociones masivas y creación del nuevo periodo." 
                    icon={<ClockIcon className="h-6 w-6"/>}
                    buttonText="Asistente Promoción"
                    color="bg-purple-600"
                    onClick={() => setIsPromotionOpen(true)}
                />
            </div>
        </section>

        {/* SECCIÓN 3: INFRAESTRUCTURA Y COMUNICACIÓN */}
        <section>
            <div className="border-b-2 border-slate-100 pb-3 mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <ManageIcon className="h-6 w-6 text-slate-500" />
                    Infraestructura y Configuraciones
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ManageCard 
                    title="Aulas y Plantas" 
                    description="Catálogo de espacios físicos, laboratorios y capacidad instalada." 
                    icon={<ManageIcon className="h-6 w-6"/>}
                    buttonText="Gestionar Aulas"
                    onClick={() => setView('rooms')}
                />
                 <ManageCard 
                    title="Franjas Horarias" 
                    description="Configurar los periodos de clase y recreos por jornada." 
                    icon={<ClockIcon className="h-6 w-6"/>}
                    buttonText="Configurar Franjas"
                    onClick={() => setView('timetables')}
                />
                <ManageCard 
                    title="Canales de Notificación" 
                    description="Habilitar SMS, Email y Mensajería Interna para la institución." 
                    icon={<ChatBubbleIcon className="h-6 w-6"/>}
                    buttonText="Configurar Canales"
                    onClick={() => setView('communication')}
                />
                <ManageCard 
                    title="Red de Apoyo" 
                    description="Contactos externos para derivaciones de salud y seguridad." 
                    icon={<PlusIcon className="h-6 w-6"/>}
                    buttonText="Gestionar Red"
                    onClick={() => setView('support')}
                />
                 <ManageCard 
                    title="Calendario Escolar" 
                    description="Definir feriados, días no lectivos y eventos institucionales." 
                    icon={<CalendarIcon className="h-6 w-6"/>}
                    buttonText="Gestionar Fechas"
                    onClick={() => setView('calendar')}
                />
            </div>
        </section>
      </div>
    );

    const renderStaffControl = () => (
        <div className="space-y-8">
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
            case 'pei_builder': return <div><button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">&larr; Volver</button><PeiBuilder /></div>;
            case 'quality_standards': return <div><button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">&larr; Volver</button><SchoolStandardsManager /></div>;
            case 'staff_control': return <div><button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">&larr; Volver</button>{renderStaffControl()}</div>;
            case 'users': return <UserManagement users={institutionData.users} allClasses={institutionData.classes} allStudents={institutionData.students} onUpdateUsers={handleUpdateInstitutionUsers} />;
            case 'classes': return <ClassManagement classes={institutionData.classes} users={institutionData.users} students={institutionData.students} timetables={institutionData.timetables} onUpdateClasses={handleUpdateInstitutionClasses} onBack={() => setView('dashboard')} />;
            case 'schedule': return <ScheduleManagement schedule={schedule} classes={institutionData.classes} timeSlots={timeSlots} subjects={institutionData.subjects} rooms={institutionData.rooms} timetables={institutionData.timetables} users={institutionData.users} onUpdateSchedule={handleUpdateInstitutionSchedule} onBack={() => setView('dashboard')} />;
            case 'students': return <StudentManagement students={institutionData.students} users={institutionData.users} classes={institutionData.classes} onUpdateStudents={handleUpdateInstitutionStudents} onUpdateUsers={handleUpdateInstitutionUsers} onBack={() => setView('dashboard')} />;
            case 'timetables': return <TimetableManagementComponent timetables={institutionData.timetables} timeSlots={institutionData.timeSlots} onUpdateTimetables={handleUpdateInstitutionTimetables} onUpdateTimeSlots={handleUpdateInstitutionTimeSlots} institutionId={currentUser.institutionId!} onBack={() => setView('dashboard')} />;
            case 'subjects': return <SubjectManagement subjects={institutionData.subjects} users={institutionData.users} onUpdateSubjects={handleUpdateInstitutionSubjects} onBack={() => setView('dashboard')} />;
            case 'rooms': return <RoomManagement rooms={institutionData.rooms} onUpdateRooms={handleUpdateInstitutionRooms} onBack={() => setView('dashboard')} />;
            case 'communication': return <CommunicationManagement onBack={() => setView('dashboard')} />;
            case 'support': return <SupportContactManagement contacts={institutionData.supportContacts} onUpdateContacts={handleUpdateInstitutionSupportContacts} onBack={() => setView('dashboard')} />;
            case 'calendar': return <AcademicCalendarManagement events={institutionData.academicCalendarEvents} onUpdateEvents={handleUpdateInstitutionAcademicCalendarEvents} onBack={() => setView('dashboard')} />;
            default: return renderDashboard();
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión del Centro</h2>
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
