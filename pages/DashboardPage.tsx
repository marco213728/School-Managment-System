import React, { useContext, useState, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Role, Student, User, Class, ActivityType, AttendanceStatus, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention } from '../types';
import StudentProfileCard from '../components/student/StudentProfileCard';
import { MOCK_ATTENDANCE, MOCK_ACTIVITIES } from '../constants';
import { UsersIcon, GraduationCapIcon, AttendanceIcon, ReportIcon, CalendarIcon, ChatBubbleIcon, ManageIcon, ClipboardListIcon, ClockIcon } from '../components/icons/Icons';
import ScheduleView from '../components/schedule/ScheduleView';

interface DashboardPageProps {
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
    onNavigate?: (page: any) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    </div>
);

const QuickLinkCard: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
     <a href="#" onClick={(e) => { e.preventDefault(); if(onClick) onClick(); }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-1 transition-all group">
        <div className="bg-slate-100 p-4 rounded-full group-hover:bg-primary-100 transition-colors">
            {icon}
        </div>
        <p className="mt-3 font-semibold text-slate-700">{label}</p>
    </a>
);

interface AdminDashboardProps {
    users: User[];
    students: Student[];
    classes: Class[];
    onNavigate?: (page: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, students, classes, onNavigate }) => {
    const { user: currentUser } = useContext(UserContext);

    const stats = useMemo(() => {
        if (!currentUser?.institutionId) return { teacherCount: 0, studentCount: 0, todayTardies: 0, todayAbsences: 0, upcomingExams: [] };
        const institutionId = currentUser.institutionId;

        const teacherCount = users.filter(u => u.institutionId === institutionId && u.role === Role.Teacher).length;
        const studentCount = students.filter(s => s.institutionId === institutionId).length;
        
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = MOCK_ATTENDANCE.filter(a => a.institutionId === institutionId && a.date === today);
        const todayTardies = todayAttendance.filter(a => a.status === AttendanceStatus.Tardy).length;
        const todayAbsences = todayAttendance.filter(a => a.status === AttendanceStatus.Unexcused).length;

        const classMap = new Map(classes.map(c => [c.id, c.name]));
        const upcomingExams = MOCK_ACTIVITIES
            .filter(a => a.institutionId === institutionId && a.type === ActivityType.Exam && new Date(a.deliveryDate) >= new Date())
            .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
            .slice(0, 5);

        return { teacherCount, studentCount, todayTardies, todayAbsences, upcomingExams };
    }, [currentUser, users, students, classes]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <StatCard icon={<UsersIcon className="h-6 w-6 text-primary-600"/>} label="Alumnos Activos" value={stats.studentCount} color="bg-primary-100" />
            <StatCard icon={<GraduationCapIcon className="h-6 w-6 text-primary-600"/>} label="Profesores" value={stats.teacherCount} color="bg-primary-100" />
            <StatCard icon={<AttendanceIcon className="h-6 w-6 text-rose-600"/>} label="Faltas Hoy" value={stats.todayAbsences} color="bg-rose-100" />
            <StatCard icon={<ClockIcon className="h-6 w-6 text-amber-600"/>} label="Atrasos Hoy" value={stats.todayTardies} color="bg-amber-100" />
            
            {/* Quick Links */}
            <div className="md:col-span-2 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                <QuickLinkCard icon={<UsersIcon className="h-8 w-8 text-primary-600"/>} label="Alumnos" onClick={() => onNavigate && onNavigate('students')} />
                <QuickLinkCard icon={<ClipboardListIcon className="h-8 w-8 text-primary-600"/>} label="Clases" onClick={() => onNavigate && onNavigate('manage')} />
                <QuickLinkCard icon={<CalendarIcon className="h-8 w-8 text-primary-600"/>} label="Horarios" onClick={() => onNavigate && onNavigate('manage')} />
                <QuickLinkCard icon={<ManageIcon className="h-8 w-8 text-primary-600"/>} label="Gestión" onClick={() => onNavigate && onNavigate('manage')} />
            </div>

            {/* Upcoming Exams */}
            <div className="md:col-span-2 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Próximas Evaluaciones</h3>
                <div className="space-y-4">
                    {stats.upcomingExams.length > 0 ? (
                        stats.upcomingExams.map(exam => (
                            <div key={exam.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-800">{exam.title}</p>
                                    <p className="text-sm text-slate-500">{classes.find(c => c.id === exam.classId)?.name}</p>
                                </div>
                                <p className="text-sm font-medium text-slate-600">{new Date(exam.deliveryDate + 'T00:00:00').toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto" />
                            <p className="mt-2 text-slate-500">No hay evaluaciones próximas.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Notifications/Communications */}
            <div className="md:col-span-2 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-lg font-semibold text-slate-800 mb-4">Actividad Reciente</h3>
                 <div className="text-center py-8">
                    <ChatBubbleIcon className="h-12 w-12 text-slate-300 mx-auto" />
                    <p className="mt-2 text-slate-500">No hay comunicaciones recientes.</p>
                    <button onClick={() => onNavigate && onNavigate('communications')} className="mt-4 text-sm font-semibold text-primary-600 hover:underline">Enviar Comunicación</button>
                 </div>
            </div>
        </div>
    );
};

interface TeacherDashboardProps {
    schedule: ScheduleEntry[];
    subjects: Subject[];
    timeSlots: TimeSlot[];
    rooms: Room[];
    timetables: Timetable[];
    users: User[];
    classes: Class[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ schedule, subjects, timeSlots, rooms, timetables, users, classes }) => {
    const { user: currentUser } = useContext(UserContext);

    const teacherData = useMemo(() => {
        if (!currentUser) return null;

        const teacherSubjects = subjects.filter(s => s.teacherId === currentUser.id);
        const teacherSubjectIds = teacherSubjects.map(s => s.id);
        
        const teacherScheduleEntries = schedule.filter(e => teacherSubjectIds.includes(e.subjectId));

        const teacherClassIds = new Set<string>();
        teacherScheduleEntries.forEach(e => teacherClassIds.add(e.classId));
        
        const teacherTimetableIds = new Set<string>();
        classes.forEach(c => {
            if (teacherClassIds.has(c.id) && c.timetableId) {
                teacherTimetableIds.add(c.timetableId);
            }
        });

        const relevantTimeSlots = timeSlots.filter(ts => teacherTimetableIds.has(ts.timetableId));

        return {
            teacherScheduleEntries,
            relevantTimeSlots,
        };
    }, [currentUser, schedule, subjects, classes, timeSlots]);
    
    if (!teacherData) return <p>Cargando horario...</p>;
    
    return (
        <div className="space-y-6">
            <ScheduleView
                title="Mi Horario Semanal"
                scheduleEntries={teacherData.teacherScheduleEntries}
                timeSlots={teacherData.relevantTimeSlots}
                subjects={subjects}
                classes={classes}
                rooms={rooms}
                users={users}
                viewType="teacher"
            />
        </div>
    );
};

const ParentDashboard: React.FC<DashboardPageProps> = ({ students, onUpdateStudents, users, classes, schedule, subjects, timeSlots, rooms, timetables, viccInterventions, onUpdateViccInterventions }) => {
    const { user } = useContext(UserContext);
    const [isProfileOpen, setProfileOpen] = useState(false);

    const child = useMemo(() => {
        if (!user?.childId) return null;
        return students.find(s => s.id === user.childId);
    }, [user, students]);


    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Asistencia Reciente de {child?.name.split(' ')[0]}</h3>
                    <p className="text-rose-500 font-semibold">Falta registrada hoy a las 8:30.</p>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Próximas Actividades</h3>
                     <div className="flex flex-col justify-between h-full flex-grow">
                        <p><strong>Examen de Álgebra</strong> - 15 de Agosto</p>
                        <button 
                            onClick={() => setProfileOpen(true)}
                            className="mt-4 w-full text-center px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700"
                        >
                            Ver Perfil Completo del Estudiante
                        </button>
                    </div>
                </div>
            </div>
            {isProfileOpen && user?.childId && (
                <StudentProfileCard 
                    studentId={user.childId} 
                    onClose={() => setProfileOpen(false)}
                    isEditable={false}
                    allStudents={students}
                    onUpdateStudents={onUpdateStudents}
                    allUsers={users}
                    allClasses={classes}
                    schedule={schedule}
                    subjects={subjects}
                    timeSlots={timeSlots}
                    rooms={rooms}
                    timetables={timetables}
                    viccInterventions={viccInterventions}
                    onUpdateViccInterventions={onUpdateViccInterventions}
                    isModal={true}
                />
            )}
        </>
    );
};

const StudentDashboard: React.FC<DashboardPageProps> = (props) => {
    const { user } = useContext(UserContext);
    
    const studentActivities = useMemo(() => {
        if (!user) return [];
        return MOCK_ACTIVITIES
            .filter(act => act.institutionId === user.institutionId && user.classIds?.includes(act.classId))
            .sort((a,b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
            .slice(0, 3);
    }, [user]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Próximas Actividades</h3>
                {studentActivities.length > 0 ? (
                    <ul className="space-y-3">
                        {studentActivities.map(act => (
                            <li key={act.id}>
                                <p className="font-semibold text-slate-800">{act.title}</p>
                                <p className="text-sm text-slate-500">{act.type} - Entrega: {act.deliveryDate}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto" />
                        <p className="mt-2 text-slate-500">No tienes actividades próximas.</p>
                    </div>
                )}
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Accesos Rápidos</h3>
                <p className="text-sm text-slate-600">
                    Usa el menú de la izquierda para navegar a tu horario, asistencia y lista de actividades.
                </p>
            </div>
        </div>
    );
};


const DashboardPage: React.FC<DashboardPageProps> = (props) => {
    const { user } = useContext(UserContext);
    
    const renderDashboard = () => {
        switch (user?.role) {
            case Role.InstitutionAdmin:
            case Role.Vicerrector:
            case Role.InspectorGeneral:
                return <AdminDashboard users={props.users} students={props.students} classes={props.classes} onNavigate={props.onNavigate} />;
            case Role.Teacher:
                return <TeacherDashboard {...props} />;
            case Role.Parent:
                return <ParentDashboard {...props} />;
            case Role.Student:
                return <StudentDashboard {...props} />;
            default:
                return <p>No se pudo cargar el dashboard.</p>;
        }
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Bienvenido, {user?.name}</h2>
            {renderDashboard()}
        </div>
    );
};

export default DashboardPage;