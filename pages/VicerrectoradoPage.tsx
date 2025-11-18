
import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MicroPlan, ViccIntervention, Gradebook, User, Subject, Class, Student, ClassroomVisit, TrainingSession, InstitutionalDocument, MeetingRecord, Role, Notification } from '../types';
import { MOCK_CLASSROOM_VISITS, MOCK_TRAINING_SESSIONS, MOCK_INSTITUTIONAL_DOCUMENTS, MOCK_MEETING_RECORDS } from '../constants';
import { VicerrectoradoIcon, UsersIcon, ReportIcon, ClipboardListIcon, PlusIcon, SearchIcon, ArchiveBoxIcon, ClipboardDocumentCheckIcon, CheckCircleIcon, CalendarIcon, EditIcon } from '../components/icons/Icons';
import ClassroomVisitForm from '../components/vicerrectorado/ClassroomVisitForm';

interface VicerrectoradoPageProps {
    microPlans: MicroPlan[];
    viccInterventions: ViccIntervention[];
    gradebooks: Gradebook[];
    users: User[];
    subjects: Subject[];
    classes: Class[];
    students: Student[];
    onNavigate: (page: any) => void;
    notifications?: Notification[];
    onUpdateNotifications?: (notifications: Notification[]) => void;
}

const VicerrectoradoPage: React.FC<VicerrectoradoPageProps> = ({ microPlans, viccInterventions, gradebooks, users, subjects, classes, students, onNavigate, notifications, onUpdateNotifications }) => {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState<'pedagogical' | 'student_support' | 'institutional'>('pedagogical');

    // Mock Data States
    const [visits, setVisits] = useState<ClassroomVisit[]>(MOCK_CLASSROOM_VISITS);
    const [trainings, setTrainings] = useState<TrainingSession[]>(MOCK_TRAINING_SESSIONS);
    const [documents, setDocuments] = useState<InstitutionalDocument[]>(MOCK_INSTITUTIONAL_DOCUMENTS);
    const [meetings, setMeetings] = useState<MeetingRecord[]>(MOCK_MEETING_RECORDS);

    // Form States
    const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<ClassroomVisit | null>(null);

    // Derived Data for GDAA
    const completedVisits = useMemo(() => visits.filter(v => v.status === 'Completed'), [visits]);
    const scheduledVisits = useMemo(() => visits.filter(v => v.status === 'Scheduled').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [visits]);
    
    const visitStats = useMemo(() => {
        const uniqueTeachers = new Set(completedVisits.map(v => v.teacherId)).size;
        const totalTeachers = users.filter(u => u.role === Role.Teacher).length;
        const avgRating = completedVisits.length > 0 
            ? (completedVisits.reduce((acc, curr) => acc + (curr.rating || 0), 0) / completedVisits.length).toFixed(2) 
            : '0.00';
        return { uniqueTeachers, totalTeachers, avgRating };
    }, [completedVisits, users]);

    const pendingPlans = useMemo(() => {
        return microPlans.filter(p => p.status === 'Pendiente de Revisión');
    }, [microPlans]);

    const lowPerformanceStudents = useMemo(() => {
        const lowPerformers: any[] = [];
        gradebooks.forEach(gb => {
            gb.records.forEach(rec => {
                if (rec.notaFinal100 > 0 && rec.notaFinal100 < 7) {
                    const student = students.find(s => s.id === rec.studentId);
                    const subject = subjects.find(s => s.id === gb.subjectId);
                    const teacher = users.find(u => u.id === subject?.teacherId);
                    if (student && subject) {
                        lowPerformers.push({
                            studentName: student.name,
                            subjectName: subject.name,
                            teacherName: teacher?.name || 'N/A',
                            grade: rec.notaFinal100,
                            observation: rec.observacionFinal
                        });
                    }
                }
            });
        });
        return lowPerformers;
    }, [gradebooks, students, subjects, users]);

    const handleSaveVisit = (visit: ClassroomVisit) => {
        if (visits.some(v => v.id === visit.id)) {
            // Updating existing
            setVisits(visits.map(v => v.id === visit.id ? visit : v));
        } else {
            // Creating new
            setVisits([...visits, visit]);
            
            // Notify Teacher if it's a new scheduled visit
            if (notifications && onUpdateNotifications && visit.status === 'Scheduled') {
                const teacher = users.find(u => u.id === visit.teacherId);
                if (teacher) {
                    const newNotification: Notification = {
                        id: `notif-visit-${Date.now()}`,
                        institutionId: user!.institutionId!,
                        userId: teacher.id,
                        title: 'Acompañamiento Áulico Programado',
                        message: `Se ha programado una visita áulica para el ${new Date(visit.date).toLocaleDateString()} a las ${visit.startTime}. Enfoque: ${visit.focus}.`,
                        date: new Date().toISOString(),
                        read: false
                    };
                    onUpdateNotifications([...notifications, newNotification]);
                }
            }
        }
        setIsVisitFormOpen(false);
    };

    const TabButton = ({ tab, label, icon }: { tab: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
            {icon}
            {label}
        </button>
    );

    const renderPedagogicalModule = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Actions Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-primary-600" />
                        Gestión Curricular
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div>
                                <p className="text-sm font-semibold text-yellow-800">{pendingPlans.length} Planes Pendientes</p>
                                <p className="text-xs text-yellow-600">Requieren revisión</p>
                            </div>
                            <button onClick={() => onNavigate('curricular_planning')} className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">Revisar</button>
                        </div>
                        <button onClick={() => onNavigate('curricular_planning')} className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex justify-between items-center group">
                            <span>Planificación Microcurricular</span>
                            <span className="text-primary-600 opacity-0 group-hover:opacity-100">Ir &rarr;</span>
                        </button>
                        <button onClick={() => onNavigate('curriculum_repository')} className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex justify-between items-center group">
                            <span>Repositorio Curricular (DCDs)</span>
                            <span className="text-primary-600 opacity-0 group-hover:opacity-100">Ir &rarr;</span>
                        </button>
                    </div>
                </div>

                {/* GDAA Module (Acompañamiento Áulico) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <UsersIcon className="h-5 w-5 text-blue-600" />
                            Gestión del Acompañamiento Áulico (GDAA)
                        </h3>
                        <button onClick={() => { setEditingVisit(null); setIsVisitFormOpen(true); }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-1">
                            <PlusIcon className="h-3 w-3" /> Planificar Visita
                        </button>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                            <p className="text-2xl font-bold text-blue-700">{visitStats.uniqueTeachers}<span className="text-xs text-gray-500 font-normal">/{visitStats.totalTeachers}</span></p>
                            <p className="text-xs text-blue-600 uppercase font-semibold">Docentes Visitados</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
                            <p className="text-2xl font-bold text-green-700">{visitStats.avgRating}<span className="text-xs text-gray-500 font-normal">/4</span></p>
                            <p className="text-xs text-green-600 uppercase font-semibold">Promedio Institucional</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-100">
                            <p className="text-2xl font-bold text-purple-700">{scheduledVisits.length}</p>
                            <p className="text-xs text-purple-600 uppercase font-semibold">Visitas Programadas</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Agenda List */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-600 mb-3 uppercase flex items-center gap-2"><CalendarIcon className="h-4 w-4"/> Agenda de Visitas</h4>
                            {scheduledVisits.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {scheduledVisits.map(visit => (
                                        <div key={visit.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 bg-white shadow-sm">
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{users.find(u => u.id === visit.teacherId)?.name} <span className="font-normal text-gray-500 text-xs">({visit.className})</span></p>
                                                <p className="text-xs text-gray-500">{new Date(visit.date).toLocaleDateString()} - {visit.startTime} • {visit.focus}</p>
                                            </div>
                                            <button onClick={() => { setEditingVisit(visit); setIsVisitFormOpen(true); }} className="text-xs bg-white border border-blue-300 text-blue-600 px-3 py-1 rounded hover:bg-blue-50">
                                                Ejecutar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center border border-dashed rounded-lg bg-gray-50 text-gray-500 text-sm">
                                    No hay visitas programadas.
                                </div>
                            )}
                        </div>

                        {/* Recent Completed List */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-600 mb-3 uppercase flex items-center gap-2"><CheckCircleIcon className="h-4 w-4"/> Historial Reciente</h4>
                             {completedVisits.length > 0 ? (
                                 <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50 text-gray-600 font-semibold">
                                            <tr>
                                                <th className="p-2">Fecha</th>
                                                <th className="p-2">Docente</th>
                                                <th className="p-2 text-center">Calif.</th>
                                                <th className="p-2 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y bg-white">
                                            {completedVisits.slice(0, 4).map(visit => (
                                                <tr key={visit.id} className="hover:bg-gray-50">
                                                    <td className="p-2">{new Date(visit.date).toLocaleDateString()}</td>
                                                    <td className="p-2">{users.find(u => u.id === visit.teacherId)?.name.split(' ')[1]}</td>
                                                    <td className="p-2 text-center">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${visit.rating! >= 3.5 ? 'bg-green-100 text-green-800' : visit.rating! >= 2.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                            {visit.rating}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-right">
                                                        <button onClick={() => { setEditingVisit(visit); setIsVisitFormOpen(true); }} className="text-blue-600 hover:underline text-xs">Ver Acta</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                 <div className="p-4 text-center border border-dashed rounded-lg bg-gray-50 text-gray-500 text-sm">
                                    No se han realizado visitas aún.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Training Plan */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <ArchiveBoxIcon className="h-5 w-5 text-purple-600" />
                    Plan de Capacitación Docente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trainings.map(train => (
                        <div key={train.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-800">{train.title}</h4>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{new Date(train.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{train.topic}</p>
                            <p className="text-xs text-gray-500 mt-2">Dictado por: {train.trainer} • Duración: {train.duration}</p>
                            <p className="text-xs text-purple-600 font-semibold mt-1">{train.attendees.length} Asistentes registrados</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStudentSupportModule = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <ReportIcon className="h-5 w-5 text-red-600" />
                    Alerta de Rendimiento Académico (Promedio &lt; 7/10)
                </h3>
                {lowPerformanceStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-red-50 text-red-800 font-semibold">
                                <tr>
                                    <th className="p-3">Estudiante</th>
                                    <th className="p-3">Asignatura</th>
                                    <th className="p-3">Docente</th>
                                    <th className="p-3 text-center">Nota Final</th>
                                    <th className="p-3">Estado</th>
                                    <th className="p-3">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {lowPerformanceStudents.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium">{item.studentName}</td>
                                        <td className="p-3">{item.subjectName}</td>
                                        <td className="p-3 text-gray-500">{item.teacherName}</td>
                                        <td className="p-3 text-center font-bold text-red-600">{item.grade.toFixed(2)}</td>
                                        <td className="p-3"><span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">{item.observation}</span></td>
                                        <td className="p-3"><button className="text-blue-600 hover:underline text-xs font-semibold">Iniciar Plan Refuerzo</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">No se detectaron alertas de bajo rendimiento en los registros actuales.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-indigo-600" />
                        Coordinación DECE & Vicerrectorado
                    </h3>
                    <button onClick={() => onNavigate('citaciones')} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">Ver Citaciones</button>
                </div>
                <div className="space-y-3">
                    {viccInterventions.map(int => (
                        <div key={int.id} className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-indigo-900">{int.type}</p>
                                <p className="text-sm text-indigo-700">{students.find(s => s.id === int.studentId)?.name}</p>
                                <p className="text-xs text-indigo-500 mt-1">{int.summary}</p>
                            </div>
                            <span className="text-xs font-semibold bg-white px-2 py-1 rounded border text-gray-500">{new Date(int.date).toLocaleDateString()}</span>
                        </div>
                    ))}
                    {viccInterventions.length === 0 && <p className="text-gray-500 text-sm text-center">No hay intervenciones recientes registradas por Vicerrectorado.</p>}
                </div>
            </div>
        </div>
    );

    const renderInstitutionalModule = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ClipboardListIcon className="h-5 w-5 text-teal-600" />
                        Instrumentos de Gestión Escolar
                    </h3>
                    <div className="space-y-4">
                        {documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${doc.status === 'Vigente' ? 'bg-green-500' : doc.status === 'Aprobado' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                                        {doc.type}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{doc.title}</p>
                                        <p className="text-xs text-gray-500">Ver: {doc.version} • Act: {new Date(doc.lastUpdated).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${doc.status === 'Vigente' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{doc.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-orange-600" />
                        Juntas y Comités
                    </h3>
                    <div className="space-y-4">
                        {meetings.map(meet => (
                            <div key={meet.id} className="border-l-4 border-orange-500 pl-4 py-1">
                                <div className="flex justify-between">
                                    <h4 className="font-bold text-gray-800">{meet.title}</h4>
                                    <span className="text-xs text-gray-500">{new Date(meet.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{meet.summary}</p>
                                <div className="mt-2 flex gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{meet.type}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{meet.attendees.length} Asistentes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Vicerrectorado</h2>
                    <p className="text-gray-600 text-sm">Gestión Académica, Pedagógica e Institucional</p>
                </div>
            </div>

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    <TabButton tab="pedagogical" label="Gestión Curricular y Pedagógica" icon={<ClipboardDocumentCheckIcon className="h-5 w-5"/>} />
                    <TabButton tab="student_support" label="Rendimiento y Apoyo Estudiantil" icon={<UsersIcon className="h-5 w-5"/>} />
                    <TabButton tab="institutional" label="Gestión Institucional" icon={<ArchiveBoxIcon className="h-5 w-5"/>} />
                </nav>
            </div>

            {activeTab === 'pedagogical' && renderPedagogicalModule()}
            {activeTab === 'student_support' && renderStudentSupportModule()}
            {activeTab === 'institutional' && renderInstitutionalModule()}

            {isVisitFormOpen && user && (
                <ClassroomVisitForm
                    isOpen={isVisitFormOpen}
                    onClose={() => setIsVisitFormOpen(false)}
                    onSave={handleSaveVisit}
                    visitToEdit={editingVisit}
                    teachers={users.filter(u => u.role === Role.Teacher)}
                    classes={classes}
                    subjects={subjects}
                    currentUser={user}
                />
            )}
        </div>
    );
};

export default VicerrectoradoPage;
