

import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MicroPlan, ViccIntervention, Gradebook, User, Subject, Class, Student, ClassroomVisit, TrainingSession, InstitutionalDocument, MeetingRecord, Role, Notification, ReinforcementPlan } from '../types';
import { MOCK_CLASSROOM_VISITS, MOCK_TRAINING_SESSIONS, MOCK_INSTITUTIONAL_DOCUMENTS, MOCK_MEETING_RECORDS } from '../constants';
import { VicerrectoradoIcon, UsersIcon, ReportIcon, ClipboardListIcon, PlusIcon, SearchIcon, ArchiveBoxIcon, ClipboardDocumentCheckIcon, CheckCircleIcon, CalendarIcon, EditIcon, GraduationCapIcon } from '../components/icons/Icons';
import ClassroomVisitForm from '../components/vicerrectorado/ClassroomVisitForm';
import ReinforcementList from '../components/vicerrectorado/ReinforcementList';
import ReinforcementForm from '../components/vicerrectorado/ReinforcementForm';

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
    // FIX: Add reinforcementPlans and its updater to the component's props.
    reinforcementPlans: ReinforcementPlan[];
    onUpdateReinforcementPlans: (plans: ReinforcementPlan[]) => void;
}

const VicerrectoradoPage: React.FC<VicerrectoradoPageProps> = ({ microPlans, viccInterventions, gradebooks, users, subjects, classes, students, onNavigate, notifications, onUpdateNotifications, reinforcementPlans, onUpdateReinforcementPlans }) => {
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
    const [isReinforcementFormOpen, setIsReinforcementFormOpen] = useState(false);
    const [editingReinforcementPlan, setEditingReinforcementPlan] = useState<ReinforcementPlan | null>(null);

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

    const handleSaveVisit = (visit: ClassroomVisit) => {
        if (visits.some(v => v.id === visit.id)) {
            setVisits(visits.map(v => v.id === visit.id ? visit : v));
        } else {
            setVisits([...visits, visit]);
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

    const handleSaveReinforcement = (plan: ReinforcementPlan) => {
        if (reinforcementPlans.some(p => p.id === plan.id)) {
            onUpdateReinforcementPlans(reinforcementPlans.map(p => p.id === plan.id ? plan : p));
        } else {
            onUpdateReinforcementPlans([...reinforcementPlans, plan]);
        }
        setIsReinforcementFormOpen(false);
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
                     <div className="grid grid-cols-3 gap-4 mb-6">
                         <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                            <p className="text-2xl font-bold text-blue-700">{visitStats.uniqueTeachers}<span className="text-xs text-gray-500 font-normal">/{visitStats.totalTeachers}</span></p>
                            <p className="text-xs text-blue-600 uppercase font-semibold">Docentes Visitados</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
                            <p className="text-2xl font-bold text-green-700">{visitStats.avgRating}<span className="text-xs text-gray-500 font-normal">/4</span></p>
                            <p className="text-xs text-green-600 uppercase font-semibold">Promedio Rating</p>
                        </div>
                         <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-100">
                            <p className="text-2xl font-bold text-purple-700">{scheduledVisits.length}</p>
                            <p className="text-xs text-purple-600 uppercase font-semibold">Programadas</p>
                        </div>
                     </div>
                     <div className="space-y-2 max-h-40 overflow-y-auto">
                        {scheduledVisits.length === 0 && <p className="text-sm text-gray-400">No hay visitas programadas.</p>}
                        {scheduledVisits.map(v => (
                             <div key={v.id} className="flex justify-between p-2 border rounded text-sm">
                                <span>{users.find(u=>u.id===v.teacherId)?.name}</span>
                                <span className="text-gray-500">{new Date(v.date).toLocaleDateString()}</span>
                            </div>
                        ))}
                     </div>
                 </div>
            </div>
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStudentSupportModule = () => (
        <div className="space-y-6 animate-fade-in">
            
            {/* Reinforcement Module Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                    <GraduationCapIcon className="h-6 w-6 text-green-600" />
                    Gestión de Refuerzo Académico
                </h3>
                <ReinforcementList
                    plans={reinforcementPlans}
                    students={students}
                    teachers={users.filter(u => u.role === Role.Teacher)}
                    subjects={subjects}
                    classes={classes}
                    onCreate={() => { setEditingReinforcementPlan(null); setIsReinforcementFormOpen(true); }}
                    onEdit={(plan) => { setEditingReinforcementPlan(plan); setIsReinforcementFormOpen(true); }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <UsersIcon className="h-5 w-5 text-indigo-600" />
                            Coordinación DECE
                        </h3>
                         <button onClick={() => onNavigate('citaciones')} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">Ver Citaciones</button>
                    </div>
                    <div className="space-y-3">
                        {viccInterventions.slice(0, 3).map(int => (
                            <div key={int.id} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-sm">
                                <p className="font-bold text-indigo-900">{int.type}</p>
                                <p className="text-indigo-700">{students.find(s => s.id === int.studentId)?.name}</p>
                            </div>
                        ))}
                    </div>
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
                        Instrumentos de Gestión
                    </h3>
                    <div className="space-y-4">
                        {documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${doc.status === 'Vigente' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                        {doc.type}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{doc.title}</p>
                                        <p className="text-xs text-gray-500">Ver: {doc.version}</p>
                                    </div>
                                </div>
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
                                <h4 className="font-bold text-gray-800">{meet.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{meet.summary}</p>
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

            {isReinforcementFormOpen && user && (
                <ReinforcementForm
                    isOpen={isReinforcementFormOpen}
                    onClose={() => setIsReinforcementFormOpen(false)}
                    onSave={handleSaveReinforcement}
                    planToEdit={editingReinforcementPlan}
                    students={students}
                    teachers={users.filter(u => u.role === Role.Teacher)}
                    subjects={subjects}
                    classes={classes}
                    currentUser={user}
                />
            )}
        </div>
    );
};

export default VicerrectoradoPage;
