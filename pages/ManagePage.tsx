
import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Role, User, Class, Student, ScheduleEntry, SupportContact, Subject, TimeSlot, Room, Timetable, AcademicCalendarEvent, StaffAttendanceRecord } from '../types';
import { MOCK_STAFF_ATTENDANCE } from '../constants';
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
import { FingerPrintIcon } from '../components/icons/Icons';

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
}

interface ManageCardProps {
    title: string;
    children: React.ReactNode;
}

const ManageCard: React.FC<ManageCardProps> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
        {children}
    </div>
);

const ManagePage: React.FC<ManagePageProps> = ({ 
  allUsers, allClasses, allStudents, schedule, supportContacts, subjects, timeSlots, rooms, timetables, academicCalendarEvents,
  onUpdateUsers, onUpdateClasses, onUpdateSchedule, onUpdateStudents, onUpdateSupportContacts, onUpdateSubjects, onUpdateTimeSlots, onUpdateRooms, onUpdateTimetables, onUpdateAcademicCalendarEvents,
}) => {
    const { user: currentUser } = useContext(UserContext);
    const [view, setView] = useState<'dashboard' | 'classes' | 'schedule' | 'students' | 'communication' | 'support' | 'subjects' | 'rooms' | 'timetables' | 'calendar' | 'staff_control'>('dashboard');
    
    // New states for Staff Control
    const [staffAttendanceRecords, setStaffAttendanceRecords] = useState<StaffAttendanceRecord[]>(MOCK_STAFF_ATTENDANCE);
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
    const [userToEnroll, setUserToEnroll] = useState<User | null>(null);

    const institutionData = useMemo(() => {
        if (!currentUser?.institutionId) {
            return { users: [], classes: [], students: [], schedule: [], supportContacts: [], subjects: [], timeSlots: [], rooms: [], timetables: [], academicCalendarEvents: [] };
        }
        const institutionId = currentUser.institutionId;
        
        return {
            users: allUsers.filter(u => u.institutionId === institutionId),
            classes: allClasses.filter(c => c.institutionId === institutionId),
            students: allStudents.filter(s => s.institutionId === institutionId),
            schedule: schedule, // Filtering now happens inside ScheduleManagement
            supportContacts: supportContacts.filter(sc => sc.institutionId === institutionId),
            subjects: subjects.filter(s => s.institutionId === institutionId),
            timeSlots: timeSlots,
            rooms: rooms.filter(r => r.institutionId === institutionId),
            timetables: timetables.filter(t => t.institutionId === institutionId),
            academicCalendarEvents: academicCalendarEvents.filter(e => e.institutionId === institutionId),
        };
    }, [currentUser, allUsers, allClasses, allStudents, schedule, supportContacts, subjects, timeSlots, rooms, timetables, academicCalendarEvents]);

    if (!currentUser || ![Role.InstitutionAdmin, Role.InspectorGeneral].includes(currentUser.role)) {
        return (
             <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión del Centro</h2>
                <p>No tiene los permisos necesarios para acceder a esta sección.</p>
             </div>
        )
    }

    // Helper functions for staff module
    const handleRecordAttendance = (userId: string, method: 'Biometric' | 'Manual') => {
        const newRecord: StaffAttendanceRecord = {
            id: `sa-${Date.now()}`,
            institutionId: currentUser.institutionId!,
            userId,
            date: new Date().toISOString().split('T')[0],
            checkInTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            method,
            status: 'OnTime', // Simplified logic for prototype
        };
        setStaffAttendanceRecords(prev => [newRecord, ...prev]);
    };

    const handleEnrollBiometric = (success: boolean) => {
        if (success && userToEnroll) {
            const updatedUsers = allUsers.map(u => u.id === userToEnroll.id ? { ...u, biometricRegistered: true } : u);
            onUpdateUsers(updatedUsers);
        }
        setIsEnrollmentOpen(false);
    };

    const startEnrollment = () => {
        // In a real app, you'd select a user from a list. For demo, enrolling current user.
        setUserToEnroll(currentUser);
        setIsEnrollmentOpen(true);
    };

    const handleUpdateInstitutionUsers = (updatedInstUsers: User[]) => {
        const otherUsers = allUsers.filter(u => u.institutionId !== currentUser.institutionId);
        onUpdateUsers([...otherUsers, ...updatedInstUsers]);
    };

    const handleUpdateInstitutionClasses = (updatedInstClasses: Class[]) => {
        const otherClasses = allClasses.filter(c => c.institutionId !== currentUser.institutionId);
        onUpdateClasses([...otherClasses, ...updatedInstClasses]);
    };
    
    const handleUpdateInstitutionSchedule = (updatedInstSchedule: ScheduleEntry[]) => {
        onUpdateSchedule(updatedInstSchedule);
    };

    const handleUpdateInstitutionStudents = (updatedInstStudents: Student[]) => {
        const otherStudents = allStudents.filter(s => s.institutionId !== currentUser.institutionId);
        onUpdateStudents([...otherStudents, ...updatedInstStudents]);
    };

    const handleUpdateInstitutionSupportContacts = (updatedInstContacts: SupportContact[]) => {
        const otherContacts = supportContacts.filter(sc => sc.institutionId !== currentUser.institutionId);
        onUpdateSupportContacts([...otherContacts, ...updatedInstContacts]);
    }
    
    const handleUpdateInstitutionSubjects = (updatedInstSubjects: Subject[]) => {
        const otherSubjects = subjects.filter(s => s.institutionId !== currentUser.institutionId);
        onUpdateSubjects([...otherSubjects, ...updatedInstSubjects]);
    }

    const handleUpdateInstitutionTimeSlots = (updatedInstTimeSlots: TimeSlot[]) => {
        const updatedGlobalTimeSlots = timeSlots.filter(ts => ts.institutionId !== currentUser.institutionId);
        onUpdateTimeSlots([...updatedGlobalTimeSlots, ...updatedInstTimeSlots]);
    }

     const handleUpdateInstitutionRooms = (updatedInstRooms: Room[]) => {
        const otherRooms = rooms.filter(r => r.institutionId !== currentUser.institutionId);
        onUpdateRooms([...otherRooms, ...updatedInstRooms]);
    }
    
    const handleUpdateInstitutionTimetables = (updatedInstTimetables: Timetable[]) => {
        const otherTimetables = timetables.filter(t => t.institutionId !== currentUser.institutionId);
        onUpdateTimetables([...otherTimetables, ...updatedInstTimetables]);
    };
    
    const handleUpdateInstitutionAcademicCalendarEvents = (updatedEvents: AcademicCalendarEvent[]) => {
        const otherEvents = academicCalendarEvents.filter(e => e.institutionId !== currentUser.institutionId);
        onUpdateAcademicCalendarEvents([...otherEvents, ...updatedEvents]);
    };

    const renderDashboard = () => (
      <div className="space-y-6">
        {currentUser?.role === Role.InstitutionAdmin && <InstitutionManagement />}
        {currentUser?.role === Role.InstitutionAdmin && <UserManagement 
          users={institutionData.users}
          allClasses={institutionData.classes}
          allStudents={institutionData.students}
          onUpdateUsers={handleUpdateInstitutionUsers}
        />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ManageCard title="Control de Personal (Biometría)">
                <p className="text-gray-600">Registro de asistencia docente mediante huella digital o PIN.</p>
                <button onClick={() => setView('staff_control')} className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    <FingerPrintIcon className="h-5 w-5" /> Acceder al Módulo
                </button>
            </ManageCard>
            <ManageCard title="Gestionar Calendario Académico">
                <p className="text-gray-600">Definir el año lectivo y los días no laborables (feriados).</p>
                <button onClick={() => setView('calendar')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    Gestionar Calendario
                </button>
            </ManageCard>
            <ManageCard title="Gestionar Plantillas de Horario">
                <p className="text-gray-600">Crear y configurar las estructuras horarias (mañana, tarde, etc.).</p>
                <button onClick={() => setView('timetables')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    Gestionar Plantillas
                </button>
            </ManageCard>
            <ManageCard title="Gestionar Clases (Grupos)">
                <p className="text-gray-600">Crear grupos de alumnos y asignarles una plantilla de horario.</p>
                <button onClick={() => setView('classes')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    Gestionar Clases
                </button>
            </ManageCard>
             <ManageCard title="Gestionar Asignaturas">
                <p className="text-gray-600">Crear asignaturas como "Matemáticas" y asignarles un profesor.</p>
                <button onClick={() => setView('subjects')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    Gestionar Asignaturas
                </button>
            </ManageCard>
             <ManageCard title="Gestionar Aulas">
                <p className="text-gray-600">Añadir o editar las aulas y laboratorios disponibles.</p>
                <button onClick={() => setView('rooms')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    Gestionar Aulas
                </button>
            </ManageCard>
            <ManageCard title="Configurar Horario Semanal">
                <p className="text-gray-600">Asignar asignaturas a las clases en el calendario semanal.</p>
                <button onClick={() => setView('schedule')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    Configurar Horarios
                </button>
            </ManageCard>
            {currentUser?.role === Role.InstitutionAdmin && (
              <>
                <ManageCard title="Gestionar Alumnos">
                    <p className="text-gray-600">Añadir, editar y consultar los perfiles de los alumnos y sus familiares.</p>
                    <button onClick={() => setView('students')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        Ir a Gestión de Alumnos
                    </button>
                </ManageCard>
                 <ManageCard title="Canales de Comunicación">
                    <p className="text-gray-600">Configurar los métodos de notificación de la institución (email, SMS, etc.).</p>
                    <button onClick={() => setView('communication')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        Configurar Canales
                    </button>
                </ManageCard>
                 <ManageCard title="Gestionar Red de Apoyo">
                    <p className="text-gray-600">Añadir o editar contactos de la red de apoyo externa (DECE).</p>
                    <button onClick={() => setView('support')} className="mt-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        Gestionar Contactos
                    </button>
                </ManageCard>
              </>
            )}
        </div>
      </div>
    );

    const renderStaffControl = () => (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Punto de Registro de Asistencia (Kiosco)</h3>
                <StaffAttendanceKiosk 
                    users={institutionData.users.filter(u => u.role === Role.Teacher || u.role === Role.InstitutionAdmin)}
                    onRecordAttendance={handleRecordAttendance}
                />
                <div className="mt-4 text-center">
                    <button onClick={startEnrollment} className="text-sm text-primary-600 hover:underline font-medium">
                        Registrar mi huella (Enrollment)
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Reporte Administrativo</h3>
                <StaffAttendanceReport 
                    records={staffAttendanceRecords}
                    users={institutionData.users}
                />
            </div>
        </div>
    );

    const renderView = () => {
        switch (view) {
            case 'staff_control':
                return (
                    <div>
                        <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                            &larr; Volver
                        </button>
                        {renderStaffControl()}
                    </div>
                );
            case 'calendar':
                return <AcademicCalendarManagement
                    events={institutionData.academicCalendarEvents}
                    onUpdateEvents={handleUpdateInstitutionAcademicCalendarEvents}
                    onBack={() => setView('dashboard')}
                />
            case 'timetables':
              return <TimetableManagementComponent
                  timetables={institutionData.timetables}
                  timeSlots={institutionData.timeSlots}
                  onUpdateTimetables={handleUpdateInstitutionTimetables}
                  onUpdateTimeSlots={handleUpdateInstitutionTimeSlots}
                  institutionId={currentUser!.institutionId!}
                  onBack={() => setView('dashboard')}
              />
            case 'classes':
                return <ClassManagement 
                  classes={institutionData.classes}
                  users={institutionData.users}
                  students={institutionData.students}
                  timetables={institutionData.timetables}
                  onUpdateClasses={handleUpdateInstitutionClasses}
                  onBack={() => setView('dashboard')}
                />;
            case 'subjects':
                return <SubjectManagement 
                  subjects={institutionData.subjects}
                  users={institutionData.users}
                  onUpdateSubjects={handleUpdateInstitutionSubjects}
                  onBack={() => setView('dashboard')}
                />;
             case 'rooms':
                return <RoomManagement 
                  rooms={institutionData.rooms}
                  onUpdateRooms={handleUpdateInstitutionRooms}
                  onBack={() => setView('dashboard')}
                />;
            case 'schedule':
                 return <ScheduleManagement
                  schedule={schedule}
                  classes={institutionData.classes}
                  timeSlots={timeSlots}
                  subjects={institutionData.subjects}
                  rooms={institutionData.rooms}
                  timetables={institutionData.timetables}
                  users={institutionData.users}
                  onUpdateSchedule={handleUpdateInstitutionSchedule}
                  onBack={() => setView('dashboard')}
                />;
            case 'students':
                return <StudentManagement
                    students={institutionData.students}
                    users={institutionData.users}
                    classes={institutionData.classes}
                    onUpdateStudents={handleUpdateInstitutionStudents}
                    onUpdateUsers={handleUpdateInstitutionUsers}
                    onBack={() => setView('dashboard')}
                />;
            case 'communication':
                return <CommunicationManagement onBack={() => setView('dashboard')} />;
            case 'support':
                return <SupportContactManagement 
                    contacts={institutionData.supportContacts}
                    onUpdateContacts={handleUpdateInstitutionSupportContacts}
                    onBack={() => setView('dashboard')}
                />;
            case 'dashboard':
            default:
                return renderDashboard();
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión del Centro</h2>
            {renderView()}
            <BiometricEnrollmentModal 
                isOpen={isEnrollmentOpen}
                onClose={() => setIsEnrollmentOpen(false)}
                onEnroll={handleEnrollBiometric}
                userName={userToEnroll?.name || ''}
            />
        </div>
    );
};

export default ManagePage;
