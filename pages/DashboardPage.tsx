
import React, { useContext, useState, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Role, Student, User, AbsenceRequest, Class, ActivityType, AttendanceStatus, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention, FormalRequest, CronogramaEvent } from '../types';
import StudentProfileCard from '../components/student/StudentProfileCard';
import { MOCK_ATTENDANCE, MOCK_ACTIVITIES } from '../constants';
import { UsersIcon, GraduationCapIcon, AttendanceIcon, ReportIcon, CalendarIcon, ChatBubbleIcon, ManageIcon, ClipboardListIcon, ClockIcon } from '../components/icons/Icons';
import ScheduleView from '../components/schedule/ScheduleView';
import CronogramaWidget from '../components/dashboard/CronogramaWidget';

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
    formalRequests: FormalRequest[];
    cronogramaEvents: CronogramaEvent[];
    onUpdateCronogramaEvents: (events: CronogramaEvent[]) => void;
    [key: string]: any;
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
    cronogramaEvents: CronogramaEvent[];
    onUpdateCronogramaEvents: (events: CronogramaEvent[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, students, classes, onNavigate, cronogramaEvents, onUpdateCronogramaEvents }) => {
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

    const handleAddEvent = (event: Omit<CronogramaEvent, 'id' | 'status' | 'institutionId'>) => {
        const newEvent: CronogramaEvent = {
            ...event,
            id: `ce-${Date.now()}`,
            institutionId: currentUser!.institutionId!,
            status: 'Pending'
        };
        onUpdateCronogramaEvents([...cronogramaEvents, newEvent]);
    };

    const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected') => {
        onUpdateCronogramaEvents(cronogramaEvents.map(e => e.id === id ? { ...e, status } : e));
    };

    const handleEditEvent = (event: CronogramaEvent) => {
        onUpdateCronogramaEvents(cronogramaEvents.map(e => e.id === event.id ? event : e));
    };

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

            {/* Cronograma Widget - Takes 2 columns on large screens */}
            <div className="md:col-span-2 lg:col-span-2 row-span-2">
                <CronogramaWidget 
                    events={cronogramaEvents}
                    onAddEvent={handleAddEvent}
                    onUpdateStatus={handleUpdateStatus}
                    onEditEvent={handleEditEvent}
                />
            </div>

            {/* Recent Notifications/Communications */}
            <div className="md:col-span-2 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-min">
                 <h3 className="text-lg font-semibold text-slate-800 mb-4">Actividad Reciente</h3>
                 <div className="text-center py-8">
                    <ChatBubbleIcon className="h-12 w-12 text-slate-300 mx-auto" />
                    <p className="mt-2 text-slate-500">No hay comunicaciones recientes.</p>
                    <button onClick={() => onNavigate && onNavigate('communications')} className="mt-4 text-sm font-semibold text-primary-600 hover:underline">Enviar Comunicación</button>
                 </div>
            </div>

             {/* Upcoming Exams - Moved to fill remaining space if needed */}
             <div className="md:col-span-2 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-min">
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
        </div>
    );
};

interface TeacherDashboardProps {
    absenceRequests?: any[];
    onUpdateAbsenceRequests?: (r: any[]) => void;
    schedule: ScheduleEntry[];
    subjects: Subject[];
    timeSlots: TimeSlot[];
    rooms: Room[];
    timetables: Timetable[];
    users: User[];
    classes: Class[];
    cronogramaEvents: CronogramaEvent[];
    onUpdateCronogramaEvents: (events: CronogramaEvent[]) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ absenceRequests = [], onUpdateAbsenceRequests = () => {}, schedule, subjects, timeSlots, rooms, timetables, users, classes, cronogramaEvents, onUpdateCronogramaEvents }) => {
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
    
    const handleAddEvent = (event: Omit<CronogramaEvent, 'id' | 'status' | 'institutionId'>) => {
        const newEvent: CronogramaEvent = {
            ...event,
            id: `ce-${Date.now()}`,
            institutionId: currentUser!.institutionId!,
            status: 'Pending'
        };
        onUpdateCronogramaEvents([...cronogramaEvents, newEvent]);
    };

    if (!teacherData) return <p>Cargando horario...</p>;
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
                
                {/* Substitution / Absence Management for Teachers */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Mis Ausencias Reportadas</h3>
                        <button 
                            onClick={() => {
                                const formEl = document.getElementById('report-absence-form');
                                if (formEl) {
                                    formEl.classList.toggle('hidden');
                                }
                            }}
                            className="bg-primary-50 text-primary-600 hover:bg-primary-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                            + Reportar Ausencia
                        </button>
                    </div>
                    
                    <div id="report-absence-form" className="hidden mb-6 p-4 border border-primary-200 bg-primary-50 rounded-lg">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!currentUser?.institutionId || !onUpdateAbsenceRequests) return;
                            const target = e.target as HTMLFormElement;
                            const newAbsence = {
                                id: `abs-${Date.now()}`,
                                institutionId: currentUser.institutionId,
                                docenteTitularId: currentUser.id,
                                fecha: (target.elements.namedItem('fecha') as HTMLInputElement).value,
                                diaSemana: new Date((target.elements.namedItem('fecha') as HTMLInputElement).value).getDay(),
                                periodo: parseInt((target.elements.namedItem('periodo') as HTMLInputElement).value),
                                classId: (target.elements.namedItem('classId') as HTMLSelectElement).value,
                                subjectId: (target.elements.namedItem('subjectId') as HTMLSelectElement).value,
                                instrucciones: (target.elements.namedItem('instrucciones') as HTMLTextAreaElement).value,
                                planificacionUrl: (target.elements.namedItem('planificacionUrl') as HTMLInputElement).value,
                                estado: 'Pendiente',
                                creadoPorRol: currentUser.role
                            };
                            onUpdateAbsenceRequests([...(absenceRequests || []), newAbsence]);
                            target.reset();
                            target.parentElement?.classList.add('hidden');
                        }} className="space-y-4">
                            <h4 className="font-semibold text-sm text-primary-800 mb-2">Nueva Notificación de Ausencia</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                                    <input type="date" name="fecha" required className="w-full p-2 text-sm border border-gray-300 rounded-md" defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Periodo (Bloque)</label>
                                    <input type="number" name="periodo" min="1" max="10" required className="w-full p-2 text-sm border border-gray-300 rounded-md" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Clase/Paralelo</label>
                                    <select name="classId" required className="w-full p-2 text-sm border border-gray-300 rounded-md">
                                        <option value="">Seleccione...</option>
                                        {classes.filter(c => c.institutionId === currentUser?.institutionId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Asignatura</label>
                                    <select name="subjectId" required className="w-full p-2 text-sm border border-gray-300 rounded-md">
                                        <option value="">Seleccione...</option>
                                        {subjects.filter(s => s.institutionId === currentUser?.institutionId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Instrucciones para el Reemplazo / Tareas</label>
                                <textarea name="instrucciones" required className="w-full p-2 text-sm border border-gray-300 rounded-md" rows={2} placeholder="Ej: Resolver páginas 45 y 46 del libro..." />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">URL Material (Opcional)</label>
                                <input type="url" name="planificacionUrl" className="w-full p-2 text-sm border border-gray-300 rounded-md" placeholder="https://drive.google.com/..." />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={(e) => (e.target as HTMLElement).closest('#report-absence-form')?.classList.add('hidden')} className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-white">Cancelar</button>
                                <button type="submit" className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700">Enviar a Inspección</button>
                            </div>
                        </form>
                    </div>

                    {absenceRequests && absenceRequests.filter(r => r.docenteTitularId === currentUser?.id).length > 0 ? (
                        <div className="space-y-3">
                            {absenceRequests.filter(r => r.docenteTitularId === currentUser?.id).map(r => {
                                const cls = classes.find(c => c.id === r.classId);
                                const sub = subjects.find(s => s.id === r.subjectId);
                                return (
                                    <div key={r.id} className="p-3 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-3">
                                        <div>
                                            <p className="font-semibold text-sm text-gray-800">{r.fecha} - Bloque {r.periodo}</p>
                                            <p className="text-xs text-gray-500">{sub?.name} en {cls?.name}</p>
                                            {r.estado === 'Pendiente' && <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded">Pendiente de Aprobación</span>}
                                            {r.estado === 'Aprobado' && <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded">Aprobado / Reasignado</span>}
                                        </div>
                                        <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 w-full md:w-auto md:max-w-xs truncate">
                                            <span className="font-medium">Instrucciones:</span> {r.instrucciones}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No tienes ausencias reportadas.</p>
                    )}
                </div>
            </div>
            <div>
                 <CronogramaWidget 
                    events={cronogramaEvents}
                    onAddEvent={handleAddEvent}
                    onUpdateStatus={() => {}} // Teachers cannot approve
                    onEditEvent={() => {}} // Teachers cannot edit directly, only propose
                />
            </div>
        </div>
    );
};

const ParentDashboard: React.FC<DashboardPageProps> = ({ students, onUpdateStudents, users, classes, schedule, subjects, timeSlots, rooms, timetables, viccInterventions, onUpdateViccInterventions, cronogramaEvents }) => {
    const { user } = useContext(UserContext);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const myChildren = useMemo(() => {
        if (!user || !user.childIds || user.childIds.length === 0) return [];
        return students.filter(s => user.childIds?.includes(s.id));
    }, [user, students]);

    const child = useMemo(() => {
        if (!selectedChildId && myChildren.length > 0) return myChildren[0];
        return myChildren.find(s => s.id === selectedChildId);
    }, [myChildren, selectedChildId]);
    
    // Auto-select first child if not selected
    if (myChildren.length > 0 && !selectedChildId) {
         setSelectedChildId(myChildren[0].id);
    }

    if (!child) return <div className="text-gray-500">No tiene estudiantes asociados.</div>;

    return (
        <>
             {myChildren.length > 1 && (
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                    {myChildren.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedChildId(c.id)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                selectedChildId === c.id 
                                ? 'bg-primary-600 text-white' 
                                : 'bg-white text-gray-600 hover:bg-gray-100 border'
                            }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Información de {child.name.split(' ')[0]}</h3>
                        <p className="text-gray-600 mb-2">Clase: {classes.find(c => c.id === child.classId)?.name}</p>
                        {/* Add summary attendance data here if available */}
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                        <button 
                            onClick={() => setSelectedChildId(child.id)} // Trigger modal re-open if needed or just use this state to show details below
                            className="mt-4 w-full text-center px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700"
                        >
                            {/* We are reusing the modal component, but rendering it conditionally below */}
                            Ver Perfil Completo
                        </button>
                    </div>
                </div>
                <div>
                     <CronogramaWidget 
                        events={cronogramaEvents}
                        onAddEvent={() => {}} // Parents cannot add
                        onUpdateStatus={() => {}} // Parents cannot approve
                        onEditEvent={() => {}}
                    />
                </div>
            </div>

            {/* Always Render Profile Card Modal if a child is selected (and triggered via state if we want modal behavior, or inline) */}
            {/* For this dashboard, let's keep it simple: clicking the button opens the modal */}
             {selectedChildId && (
                <div className="mt-6">
                     <StudentProfileCard 
                        studentId={selectedChildId} 
                        onClose={() => {}} // No close needed if inline, or manage open state
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
                        isModal={false} // Render inline for dashboard overview
                    />
                </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
                 <CronogramaWidget 
                    events={props.cronogramaEvents}
                    onAddEvent={() => {}} // Students cannot add
                    onUpdateStatus={() => {}} // Students cannot approve
                    onEditEvent={() => {}}
                />
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
            case Role.Rector:
            case Role.JefeDECE:
            case Role.PsicologoEducativo:
            case Role.TrabajadorSocial:
            case Role.HealthProfessional:
                return <AdminDashboard 
                        users={props.users} 
                        students={props.students} 
                        classes={props.classes} 
                        onNavigate={props.onNavigate} 
                        cronogramaEvents={props.cronogramaEvents}
                        onUpdateCronogramaEvents={props.onUpdateCronogramaEvents}
                       />;
            case Role.Teacher:
                return <TeacherDashboard 
                        {...props} 
                        cronogramaEvents={props.cronogramaEvents}
                        onUpdateCronogramaEvents={props.onUpdateCronogramaEvents}
                       />;
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
