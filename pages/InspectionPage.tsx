
import React, { useState, useMemo, useContext } from 'react';
import { AttendanceRecord, Student, Class, ExitPass, Notification, User, DisciplinaryAction, InspectionVisit, ConflictMediation, QualityMetric, DisciplinarySeverity, Gradebook, Subject } from '../types';
import { UserContext } from '../contexts/UserContext';
import { MOCK_DISCIPLINARY_ACTIONS, MOCK_INSPECTION_VISITS, MOCK_QUALITY_METRICS } from '../constants';
import JustificationManagement from '../components/inspection/JustificationManagement';
import ExitPassManagement from '../components/inspection/ExitPassManagement';
import { InspectionIcon, AlertTriangleIcon, CheckCircleIcon, UsersIcon, ClipboardListIcon, ChartBarIcon, EditIcon } from '../components/icons/Icons';
import ProtocolManagement from '../components/inspection/ProtocolManagement';
import InspectionVisitForm from '../components/inspection/InspectionVisitForm';
import QualityDashboard from '../components/inspection/QualityDashboard';

interface InspectionPageProps {
    attendanceRecords: AttendanceRecord[];
    onUpdateAttendance: (records: AttendanceRecord[]) => void;
    students: Student[];
    classes: Class[];
    exitPasses: ExitPass[];
    onUpdateExitPasses: (passes: ExitPass[]) => void;
    notifications: Notification[];
    onUpdateNotifications: (notifications: Notification[]) => void;
    users: User[];
    conflictMediations?: ConflictMediation[];
    onUpdateConflictMediations?: (conflicts: ConflictMediation[]) => void;
    // New props for Quality Module
    gradebooks?: Gradebook[];
    subjects?: Subject[];
}

type InspectionView = 'dashboard' | 'justifications' | 'exit_passes';
type DashboardTab = 'compliance' | 'quality' | 'coexistence';

const InspectionPage: React.FC<InspectionPageProps> = (props) => {
    const { 
        attendanceRecords, onUpdateAttendance, students, classes, exitPasses, 
        onUpdateExitPasses, notifications, onUpdateNotifications, users, 
        conflictMediations = [], onUpdateConflictMediations,
        gradebooks = [], subjects = [] // Defaults
    } = props;

    const { user: currentUser } = useContext(UserContext);
    const [currentView, setCurrentView] = useState<InspectionView>('dashboard');
    const [activeTab, setActiveTab] = useState<DashboardTab>('compliance');

    // Mock data states
    const [disciplinaryActions, setDisciplinaryActions] = useState<DisciplinaryAction[]>(MOCK_DISCIPLINARY_ACTIONS);
    const [inspectionVisits, setInspectionVisits] = useState<InspectionVisit[]>(MOCK_INSPECTION_VISITS);

    // Form States for Inspection Visits
    const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<InspectionVisit | null>(null);

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);

    // Handle saving an inspection visit (Create or Update)
    const handleSaveVisit = (visitData: Omit<InspectionVisit, 'id' | 'institutionId' | 'inspectorId'> & { id?: string }) => {
        if (visitData.id) {
            // Edit existing
            setInspectionVisits(prev => prev.map(v => v.id === visitData.id ? { ...v, ...visitData } : v));
        } else {
            // Create new
            const newVisit: InspectionVisit = {
                ...visitData,
                id: `iv-${Date.now()}`,
                institutionId: currentUser?.institutionId || '',
                inspectorId: currentUser?.id || '',
            };
            setInspectionVisits(prev => [newVisit, ...prev]);
        }
        setIsVisitFormOpen(false);
        setEditingVisit(null);
    };

    const handleEditVisit = (visit: InspectionVisit) => {
        setEditingVisit(visit);
        setIsVisitFormOpen(true);
    };

    if (currentView === 'justifications') {
        return <JustificationManagement 
            attendanceRecords={attendanceRecords}
            onUpdateAttendance={onUpdateAttendance}
            students={students}
            classes={classes}
            onBack={() => setCurrentView('dashboard')}
        />;
    }

    if (currentView === 'exit_passes') {
        return <ExitPassManagement
            exitPasses={exitPasses}
            onUpdateExitPasses={onUpdateExitPasses}
            students={students}
            users={users}
            notifications={notifications}
            onUpdateNotifications={onUpdateNotifications}
            onBack={() => setCurrentView('dashboard')}
        />
    }

    const renderComplianceTab = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <InspectionIcon className="h-5 w-5 text-blue-600" />
                        Control Diario
                    </h3>
                    <div className="space-y-3">
                        <button onClick={() => setCurrentView('justifications')} className="w-full flex justify-between items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-800 font-medium transition-colors">
                            <span>Gestión de Justificaciones</span>
                            <span>&rarr;</span>
                        </button>
                        <button onClick={() => setCurrentView('exit_passes')} className="w-full flex justify-between items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-800 font-medium transition-colors">
                            <span>Pases de Salida</span>
                            <span>&rarr;</span>
                        </button>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardListIcon className="h-5 w-5 text-purple-600" />
                            Supervisión e Inspecciones
                        </h3>
                        <button 
                            onClick={() => { setEditingVisit(null); setIsVisitFormOpen(true); }}
                            className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                        >
                            Nueva Visita
                        </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {inspectionVisits.length > 0 ? inspectionVisits.map(visit => (
                            <div key={visit.id} className="p-3 border rounded-lg text-sm group hover:border-purple-300 transition-colors relative">
                                <div className="flex justify-between font-semibold text-gray-700">
                                    <span>{visit.target}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${visit.status === 'Realizada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{visit.status}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{new Date(visit.date).toLocaleDateString()} - {visit.type}</p>
                                <p className="text-gray-600 mt-1 line-clamp-2">{visit.findings || 'Sin observaciones.'}</p>
                                
                                <button 
                                    onClick={() => handleEditVisit(visit)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-purple-600 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200"
                                    title="Editar"
                                >
                                    <EditIcon className="h-4 w-4" />
                                </button>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 text-center py-4">No hay visitas de inspección registradas.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangleIcon className="h-5 w-5 text-red-600" />
                    Registro Disciplinario
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-semibold">
                            <tr>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Estudiante</th>
                                <th className="p-3">Infracción</th>
                                <th className="p-3 text-center">Gravedad</th>
                                <th className="p-3 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {disciplinaryActions.map(action => (
                                <tr key={action.id} className="hover:bg-gray-50">
                                    <td className="p-3">{new Date(action.date).toLocaleDateString()}</td>
                                    <td className="p-3 font-medium">{studentMap.get(action.studentId)}</td>
                                    <td className="p-3">
                                        <p className="font-semibold text-xs text-gray-700">{action.infraction}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-xs">{action.description}</p>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${action.severity === DisciplinarySeverity.Minor ? 'bg-blue-100 text-blue-800' : action.severity === DisciplinarySeverity.Serious ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                                            {action.severity}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs border ${action.status === 'Cerrado' ? 'border-green-200 text-green-700 bg-green-50' : 'border-yellow-200 text-yellow-700 bg-yellow-50'}`}>
                                            {action.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const handleDeriveToDece = (conflictId: string) => {
        if (!onUpdateConflictMediations) return;
        const updatedConflicts = conflictMediations.map(c => 
            c.id === conflictId ? { ...c, derivedToDece: true } : c
        );
        onUpdateConflictMediations(updatedConflicts);
        alert('Caso derivado al DECE exitosamente.');
    };

    const renderCoexistenceTab = () => (
        <div className="space-y-6 animate-fade-in">
            
            {/* New Protocol Management Component */}
            <ProtocolManagement students={students} users={users} />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-teal-600" />
                        Mediación de Conflictos (Leves)
                    </h3>
                    <button className="text-xs bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700">Registrar Conflicto</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-teal-50 text-teal-800 font-semibold">
                            <tr>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Partes Involucradas</th>
                                <th className="p-3">Descripción</th>
                                <th className="p-3 text-center">Estado</th>
                                <th className="p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {conflictMediations.map(conflict => (
                                <tr key={conflict.id} className="hover:bg-gray-50">
                                    <td className="p-3">{new Date(conflict.date).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        <ul className="list-disc list-inside text-xs">
                                            {conflict.partiesInvolved.map((p, i) => <li key={i}>{studentMap.get(p) || p}</li>)}
                                        </ul>
                                    </td>
                                    <td className="p-3 text-gray-600">{conflict.description}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${conflict.status === 'Resuelto' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {conflict.status}
                                        </span>
                                    </td>
                                    <td className="p-3 flex gap-2">
                                        <button className="text-teal-600 hover:underline text-xs">Ver Acta</button>
                                        {conflict.derivedToDece ? (
                                            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Derivado al DECE</span>
                                        ) : (
                                            <button 
                                                onClick={() => handleDeriveToDece(conflict.id)}
                                                className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded hover:bg-purple-200 border border-purple-200"
                                            >
                                                Derivar al DECE
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {conflictMediations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500 italic">No hay conflictos registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3">Protocolos Activos</h3>
                    <ul className="space-y-2">
                        <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">Protocolo de Acoso Escolar</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">Activo</span>
                        </li>
                        <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">Rutas de Violencia Intrafamiliar</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">Activo</span>
                        </li>
                    </ul>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3">Asesoría a la Comunidad</h3>
                    <p className="text-sm text-gray-600 mb-4">Gestión de solicitudes de orientación sobre derechos y obligaciones.</p>
                    <button className="w-full py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm font-medium">Ver Solicitudes</button>
                 </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Inspección General</h2>
                    <p className="text-gray-600 text-sm">Control, Normativa y Convivencia</p>
                </div>
            </div>

            <div className="mb-6 border-b border-gray-200 bg-white px-4 pt-2 rounded-t-lg shadow-sm">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('compliance')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'compliance' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        <div className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5"/> Control y Cumplimiento</div>
                    </button>
                    <button
                        onClick={() => setActiveTab('quality')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'quality' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        <div className="flex items-center gap-2"><ChartBarIcon className="h-5 w-5"/> Evaluación y Calidad</div>
                    </button>
                    <button
                        onClick={() => setActiveTab('coexistence')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'coexistence' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        <div className="flex items-center gap-2"><UsersIcon className="h-5 w-5"/> Convivencia y Mediación</div>
                    </button>
                </nav>
            </div>

            {activeTab === 'compliance' && renderComplianceTab()}
            
            {/* Replace static quality tab with QualityDashboard */}
            {activeTab === 'quality' && (
                <div className="animate-fade-in">
                    <QualityDashboard 
                        gradebooks={gradebooks}
                        attendanceRecords={attendanceRecords}
                        students={students}
                        subjects={subjects}
                        classes={classes}
                        users={users}
                    />
                </div>
            )}
            
            {activeTab === 'coexistence' && renderCoexistenceTab()}

            {isVisitFormOpen && (
                <InspectionVisitForm
                    isOpen={isVisitFormOpen}
                    onClose={() => setIsVisitFormOpen(false)}
                    onSave={handleSaveVisit}
                    visitToEdit={editingVisit}
                />
            )}
        </div>
    );
};

export default InspectionPage;
