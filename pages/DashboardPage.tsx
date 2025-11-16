import React, { useContext, useState, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Role, Student, User, Class, ActivityType, AttendanceStatus, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention } from '../types';
import StudentProfileCard from '../components/student/StudentProfileCard';
import { MOCK_ATTENDANCE, MOCK_ACTIVITIES } from '../constants';
import { UsersIcon, GraduationCapIcon, AttendanceIcon, ReportIcon } from '../components/icons/Icons';
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
}

// FIX: Changed Card component to be a React.FC with a props interface to fix children prop errors.
interface CardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
        {children}
    </div>
);

interface AdminDashboardProps {
    users: User[];
    students: Student[];
    classes: Class[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, students, classes }) => {
    const { user: currentUser } = useContext(UserContext);

    const stats = useMemo(() => {
        if (!currentUser?.institutionId) return null;
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
            .slice(0, 3)
            .map(exam => ({
                ...exam,
                className: classMap.get(exam.classId) || 'Clase desconocida'
            }));

        return { teacherCount, studentCount, todayTardies, todayAbsences, upcomingExams };
    }, [currentUser, users, students, classes]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Estadísticas Generales</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-100 p-3 rounded-lg"><UsersIcon className="h-6 w-6 text-primary-600"/></div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats?.studentCount}</p>
                                <p className="text-sm text-slate-500">Alumnos Activos</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="bg-primary-100 p-3 rounded-lg"><GraduationCapIcon className="h-6 w-6 text-primary-600"/></div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats?.teacherCount}</p>
                                <p className="text-sm text-slate-500">Profesores</p>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Asistencia de Hoy</h3>
                    <div className="space-y-4">
                         <div className="flex items-center gap-4">
                            <div className="bg-red-100 p-3 rounded-lg"><span className="font-bold text-red-600">!</span></div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{stats?.todayAbsences}</p>
                                <p className="text-sm text-slate-500">Faltas Injustificadas</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="bg-yellow-100 p-3 rounded-lg"><span className="font-bold text-yellow-600">!</span></div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-600">{stats?.todayTardies}</p>
                                <p className="text-sm text-slate-500">Atrasos</p>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Próximas Evaluaciones</h3>
                    <div className="space-y-3 text-slate-600 text-sm">
                        {stats?.upcomingExams && stats.upcomingExams.length > 0 ? (
                            stats.upcomingExams.map(exam => (
                                <div key={exam.id}>
                                    <p className="font-semibold text-slate-800">{exam.title}</p>
                                    <p className="text-xs text-slate-500">{exam.className} - <span className="font-medium text-slate-600">{new Date(exam.deliveryDate + 'T00:00:00').toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}</span></p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500">No hay evaluaciones próximas.</p>
                        )}
                    </div>
                </div>
            </div>
            
             <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Accesos Rápidos</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="#" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                        <UsersIcon className="h-10 w-10 text-primary-600 mb-2"/>
                        <span className="font-semibold text-slate-700">Alumnos</span>
                    </a>
                    <a href="#" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                        <GraduationCapIcon className="h-10 w-10 text-primary-600 mb-2"/>
                        <span className="font-semibold text-slate-700">Clases</span>
                    </a>
                    <a href="#" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                        <AttendanceIcon className="h-10 w-10 text-primary-600 mb-2"/>
                        <span className="font-semibold text-slate-700">Asistencia</span>
                    </a>
                    <a href="#" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                        <ReportIcon className="h-10 w-10 text-primary-600 mb-2"/>
                        <span className="font-semibold text-slate-700">Informes</span>
                    </a>
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

    const childName = useMemo(() => {
        if (!user?.childId) return "su hijo/a";
        const child = students.find(s => s.id === user.childId);
        return child?.name.split(' ')[0] || "su hijo/a";
    }, [user, students]);


    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title={`Asistencia Reciente de ${childName}`}>
                    <p className="text-red-500 font-semibold">Falta registrada hoy a las 8:30.</p>
                </Card>
                <Card title={`Próximas Actividades de ${childName}`}>
                     <div className="flex flex-col justify-between h-full">
                        <p><strong>Examen de Álgebra</strong> - 15 de Agosto</p>
                        <button 
                            onClick={() => setProfileOpen(true)}
                            className="mt-4 w-full text-left px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700"
                        >
                            Ver Perfil Completo
                        </button>
                    </div>
                </Card>
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
            <Card title="Próximas Actividades">
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
                    <p className="text-sm text-slate-500">No tienes actividades próximas.</p>
                )}
            </Card>
            <Card title="Accesos Rápidos">
                <p className="text-sm text-slate-600">
                    Usa el menú de la izquierda para navegar a tu horario, asistencia y lista de actividades.
                </p>
            </Card>
        </div>
    );
};


const DashboardPage: React.FC<DashboardPageProps> = (props) => {
    const { user } = useContext(UserContext);
    
    const renderDashboard = () => {
        switch (user?.role) {
            case Role.InstitutionAdmin:
                return <AdminDashboard users={props.users} students={props.students} classes={props.classes} />;
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