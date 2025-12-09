
import React, { useContext, useState, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Role, Student, User, Class, OvpAxis, OvpActivity, SupportContact, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention, ConflictMediation, Intervention } from '../types';
import { MOCK_OVP_ACTIVITIES } from '../constants';
import SupportNetwork from '../components/dece/SupportNetwork';
import StudentProfileCard from '../components/student/StudentProfileCard';
import { SearchIcon, CloseIcon, UsersIcon, ReportIcon, ClipboardListIcon, PlusIcon, TrashIcon, AlertTriangleIcon } from '../components/icons/Icons';
import InterventionForm from '../components/dece/InterventionForm';

interface DecePageProps {
    students: Student[];
    onUpdateStudents: (students: Student[]) => void;
    users: User[];
    classes: Class[];
    supportContacts: SupportContact[];
    schedule: ScheduleEntry[];
    subjects: Subject[];
    timeSlots: TimeSlot[];
    rooms: Room[];
    timetables: Timetable[];
    viccInterventions: ViccIntervention[];
    onUpdateViccInterventions: (interventions: ViccIntervention[]) => void;
    conflictMediations?: ConflictMediation[];
    onUpdateConflictMediations?: (conflicts: ConflictMediation[]) => void;
}

interface DeceCardProps {
    title: string;
    description: string;
    buttonText: string;
    onClick?: () => void;
    disabled?: boolean;
    badgeCount?: number;
}

const DeceCard: React.FC<DeceCardProps> = ({ title, description, buttonText, onClick, disabled = false, badgeCount }) => {
    const buttonClasses = "mt-4 w-full text-left px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed";
    const disabledButtonClasses = "mt-4 w-full text-left px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md cursor-not-allowed";

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col relative">
            {badgeCount !== undefined && badgeCount > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {badgeCount} Pendientes
                </span>
            )}
            <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
            </div>
            <button onClick={onClick} className={disabled ? disabledButtonClasses : buttonClasses} disabled={disabled}>
                {buttonText}
            </button>
        </div>
    );
};

const StudentSelector = ({ students, onSelectStudent, title }: { students: (Student & { className: string })[], onSelectStudent: (studentId: string) => void, title: string }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, students]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Buscar estudiante por nombre..."
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
                        <li key={student.id} onClick={() => onSelectStudent(student.id)} className="p-4 hover:bg-gray-50 cursor-pointer">
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.className}</p>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-center text-gray-500">No se encontraron estudiantes.</li>
                )}
            </ul>
        </div>
    );
}


const StudentOvpProfile: React.FC<{ 
    student: Student & { className: string }; 
    onClose: () => void;
    activities: OvpActivity[];
    onUpdate: (activities: OvpActivity[]) => void;
}> = ({ student, onClose, activities, onUpdate }) => {
    
    const [newActivity, setNewActivity] = useState<{ axis: OvpAxis | null, title: string }>({ axis: null, title: '' });

    const studentActivities = useMemo(() => {
        return activities.filter(act => act.studentId === student.id)
            .reduce((acc, activity) => {
                if (!acc[activity.axis]) {
                    acc[activity.axis] = [];
                }
                acc[activity.axis].push(activity);
                return acc;
            }, {} as Record<OvpAxis, OvpActivity[]>);
    }, [student.id, activities]);

    const handleSaveNewActivity = () => {
        if (!newActivity.title.trim() || !newActivity.axis) return;
        const newAct: OvpActivity = {
            id: `ovp-${Date.now()}`,
            institutionId: student.institutionId,
            studentId: student.id,
            title: newActivity.title.trim(),
            axis: newActivity.axis,
            status: 'Pendiente',
        };
        onUpdate([...activities, newAct]);
        setNewActivity({ axis: null, title: '' });
    };

    const handleToggleStatus = (activityId: string) => {
        const updatedActivities = activities.map(act => {
            if (act.id === activityId) {
                const newStatus: OvpActivity['status'] = act.status === 'Completada' ? 'Pendiente' : 'Completada';
                return { ...act, status: newStatus };
            }
            return act;
        });
        onUpdate(updatedActivities);
    };

    const handleDeleteActivity = (activityId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta actividad?')) {
            onUpdate(activities.filter(act => act.id !== activityId));
        }
    };

    const axisConfig = [
        { axis: OvpAxis.SelfKnowledge, title: 'Eje: Autoconocimiento', icon: <UsersIcon className="h-6 w-6 text-primary-700" /> },
        { axis: OvpAxis.Information, title: 'Eje: Información', icon: <ReportIcon className="h-6 w-6 text-primary-700" /> },
        { axis: OvpAxis.DecisionMaking, title: 'Eje: Toma de Decisiones', icon: <ClipboardListIcon className="h-6 w-6 text-primary-700" /> }
    ];

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[1][0]}`;
        }
        return name.substring(0, 2);
    }
    
    const avatarInitials = getInitials(student.name);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-start justify-between p-4 border-b">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-xl">
                           {avatarInitials}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
                            <p className="text-sm text-gray-500">{student.className}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto bg-gray-50 space-y-6">
                    {axisConfig.map(({ axis, title, icon }) => (
                        <div key={axis}>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">{icon} {title}</h3>
                            <div className="bg-white p-4 rounded-md border space-y-3">
                                {studentActivities[axis] && studentActivities[axis].length > 0 ? (
                                    studentActivities[axis].map(activity => (
                                        <div key={activity.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50 group">
                                            <p className="text-gray-800">{activity.title}</p>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleToggleStatus(activity.id)} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${activity.status === 'Completada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {activity.status}
                                                </button>
                                                <button onClick={() => handleDeleteActivity(activity.id)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 px-2">No hay actividades registradas en este eje.</p>
                                )}

                                {newActivity.axis === axis ? (
                                    <div className="p-2">
                                        <input 
                                            type="text"
                                            value={newActivity.title}
                                            onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Nueva actividad..."
                                            autoFocus
                                            className="w-full p-1 border rounded-md text-sm"
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={() => setNewActivity({ axis: null, title: '' })} className="text-xs px-2 py-1 bg-gray-200 rounded">Cancelar</button>
                                            <button onClick={handleSaveNewActivity} className="text-xs px-2 py-1 bg-primary-600 text-white rounded">Guardar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setNewActivity({ axis, title: '' })} className="flex items-center gap-1 text-sm text-primary-600 hover:underline mt-2 p-2">
                                        <PlusIcon className="h-4 w-4" /> Añadir Actividad
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
};


const DecePage: React.FC<DecePageProps> = ({ students, onUpdateStudents, users, classes, supportContacts, schedule, subjects, timeSlots, rooms, timetables, viccInterventions, onUpdateViccInterventions, conflictMediations = [], onUpdateConflictMediations }) => {
    const { user } = useContext(UserContext);
    const [view, setView] = useState<'dashboard' | 'student-list' | 'ovp-list' | 'referred-cases'>('dashboard');
    const [selectedStudentForFile, setSelectedStudentForFile] = useState<string | null>(null);
    const [selectedStudentForOvp, setSelectedStudentForOvp] = useState<string | null>(null);
    const [studentListTitle, setStudentListTitle] = useState('');
    const [ovpActivities, setOvpActivities] = useState<OvpActivity[]>(MOCK_OVP_ACTIVITIES);
    const [isInterventionFormOpen, setIsInterventionFormOpen] = useState(false);
    const [conflictToProcess, setConflictToProcess] = useState<ConflictMediation | null>(null);

    const institutionStudents = useMemo(() => students.filter(s => s.institutionId === user?.institutionId), [students, user]);
    const institutionClasses = useMemo(() => classes.filter(c => c.institutionId === user?.institutionId), [classes, user]);
    const institutionSupportContacts = useMemo(() => supportContacts.filter(sc => sc.institutionId === user?.institutionId), [supportContacts, user]);

    const studentsWithClass = useMemo(() => institutionStudents.map(student => {
        const classInfo = institutionClasses.find(c => c.id === student.classId);
        return { ...student, className: classInfo?.name || 'Sin clase asignada' };
    }).sort((a,b) => a.name.localeCompare(b.name)), [institutionStudents, institutionClasses]);

    const deceRoles = [Role.InstitutionAdmin, Role.JefeDECE, Role.PsicologoEducativo, Role.TrabajadorSocial];

    const referredConflicts = useMemo(() => conflictMediations.filter(c => c.derivedToDece), [conflictMediations]);

    if (!user || !deceRoles.includes(user.role)) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Módulo DECE</h2>
                <p>No tiene los permisos necesarios para acceder a esta sección.</p>
            </div>
        )
    }

    const selectedOvpStudentData = useMemo(() => {
        return studentsWithClass.find(s => s.id === selectedStudentForOvp);
    }, [selectedStudentForOvp, studentsWithClass]);

    const handleProcessConflict = (conflict: ConflictMediation) => {
        setConflictToProcess(conflict);
        setIsInterventionFormOpen(true);
    };

    const handleSaveIntervention = (intervention: any) => {
        // Here we would normally save the intervention to the backend/state
        // For prototype, we'll just log and maybe clear the conflict processing state
        console.log("Intervention saved:", intervention);
        setIsInterventionFormOpen(false);
        setConflictToProcess(null);
        alert("Intervención registrada para el caso derivado.");
    };

    const renderReferredCases = () => (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Casos Derivados de Inspección General</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-purple-50 text-purple-800 font-semibold">
                        <tr>
                            <th className="p-3">Fecha</th>
                            <th className="p-3">Estudiantes</th>
                            <th className="p-3">Descripción del Conflicto</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {referredConflicts.map(conflict => (
                            <tr key={conflict.id} className="hover:bg-gray-50">
                                <td className="p-3">{new Date(conflict.date).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <ul className="list-disc list-inside text-xs">
                                        {conflict.partiesInvolved.map((p, i) => {
                                            const student = students.find(s => s.id === p);
                                            return <li key={i}>{student ? student.name : p}</li>
                                        })}
                                    </ul>
                                </td>
                                <td className="p-3 text-gray-600">{conflict.description}</td>
                                <td className="p-3">
                                    <button 
                                        onClick={() => handleProcessConflict(conflict)}
                                        className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700 flex items-center gap-1"
                                    >
                                        <PlusIcon className="h-3 w-3" /> Registrar Intervención
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {referredConflicts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">No hay casos derivados pendientes.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (view) {
            case 'student-list':
                return <StudentSelector students={studentsWithClass} onSelectStudent={(id) => setSelectedStudentForFile(id)} title={studentListTitle} />;
            case 'ovp-list':
                return <StudentSelector students={studentsWithClass} onSelectStudent={(id) => setSelectedStudentForOvp(id)} title="Seleccionar Estudiante para OVP" />;
            case 'referred-cases':
                return renderReferredCases();
            case 'dashboard':
            default:
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DeceCard
                                title="Fichas e Historial Estudiantil"
                                description="Acceder y gestionar los registros confidenciales de los estudiantes."
                                buttonText="Gestionar Fichas"
                                onClick={() => {
                                    setStudentListTitle("Seleccionar Estudiante para Ficha/Historial");
                                    setView('student-list');
                                }}
                            />
                            <DeceCard
                                title="Gestión de Intervenciones y Casos"
                                description="Registrar, seguir y gestionar casos e intervenciones individuales o grupales."
                                buttonText="Gestionar Casos"
                                onClick={() => {
                                    setStudentListTitle("Seleccionar Estudiante para Gestión de Casos");
                                    setView('student-list');
                                }}
                            />
                            <DeceCard
                                title="Casos Derivados de Inspección"
                                description="Atender conflictos y situaciones disciplinarias derivadas por Inspección General."
                                buttonText="Ver Casos Derivados"
                                onClick={() => setView('referred-cases')}
                                badgeCount={referredConflicts.length}
                            />
                            <DeceCard
                                title="Orientación Vocacional (OVP)"
                                description="Gestionar actividades y recursos para la orientación vocacional y profesional."
                                buttonText="Gestionar OVP"
                                onClick={() => setView('ovp-list')}
                            />
                        </div>
                        <SupportNetwork contacts={institutionSupportContacts} />
                    </>
                );
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Módulo DECE - Consejería Estudiantil</h2>
                {view !== 'dashboard' && (
                    <button onClick={() => { setView('dashboard'); setSelectedStudentForFile(null); setSelectedStudentForOvp(null); }} className="text-sm font-semibold text-primary-600 hover:underline">
                        &larr; Volver al Dashboard
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {renderContent()}
            </div>

            {selectedStudentForFile && (
                <StudentProfileCard
                    studentId={selectedStudentForFile}
                    onClose={() => setSelectedStudentForFile(null)}
                    isEditable={true}
                    initialTab='dece'
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
                />
            )}
            
            {selectedStudentForOvp && selectedOvpStudentData && (
                 <StudentOvpProfile 
                    student={selectedOvpStudentData} 
                    onClose={() => setSelectedStudentForOvp(null)}
                    activities={ovpActivities}
                    onUpdate={setOvpActivities}
                 />
            )}

            {isInterventionFormOpen && conflictToProcess && (
                <InterventionForm
                    isOpen={isInterventionFormOpen}
                    onClose={() => { setIsInterventionFormOpen(false); setConflictToProcess(null); }}
                    onSave={handleSaveIntervention}
                    interventionToEdit={{
                        id: '',
                        institutionId: user.institutionId!,
                        studentId: conflictToProcess.partiesInvolved[0], // Default to first involved
                        deceProfessionalId: user.id,
                        date: new Date().toISOString().split('T')[0],
                        type: 'Sesión Individual',
                        summary: `Atención a caso derivado de Inspección: ${conflictToProcess.description}`,
                        participants: [],
                        agreements: ''
                    } as any}
                    studentName={students.find(s => s.id === conflictToProcess.partiesInvolved[0])?.name || 'Estudiante'}
                />
            )}
        </div>
    );
};

export default DecePage;
