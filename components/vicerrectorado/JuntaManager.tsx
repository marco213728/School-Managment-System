
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { JuntaDeCurso, SubjectReport, User, Class, Subject, Student, Role, Gradebook, MicroPlan, ReinforcementPlan } from '../../types';
import { MOCK_JUNTAS, MOCK_SUBJECT_REPORTS } from '../../constants';
import { PlusIcon, EditIcon, PrinterIcon, CheckCircleIcon, ClipboardListIcon, CloseIcon, CalendarIcon } from '../icons/Icons';
import SubjectReportForm from './SubjectReportForm';
import PrintableJuntaActa from './PrintableJuntaActa';

interface JuntaManagerProps {
    classes: Class[];
    subjects: Subject[];
    users: User[];
    students: Student[];
    gradebooks: Gradebook[];
    microPlans: MicroPlan[];
    reinforcementPlans: ReinforcementPlan[];
}

const JuntaManager: React.FC<JuntaManagerProps> = ({ 
    classes = [], 
    subjects = [], 
    users = [], 
    students = [], 
    gradebooks = [], 
    microPlans = [], 
    reinforcementPlans = [] 
}) => {
    const { user: currentUser } = useContext(UserContext);
    
    // State simulating database
    const [juntas, setJuntas] = useState<JuntaDeCurso[]>(MOCK_JUNTAS);
    const [reports, setReports] = useState<SubjectReport[]>(MOCK_SUBJECT_REPORTS);

    // UI State
    const [selectedJuntaId, setSelectedJuntaId] = useState<string | null>(null);
    const [isReportFormOpen, setIsReportFormOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<SubjectReport | null>(null);
    const [isActaPrintOpen, setIsActaPrintOpen] = useState(false);

    // Junta Form State (For creating/editing the meeting itself)
    const [isJuntaFormOpen, setIsJuntaFormOpen] = useState(false);
    const [juntaFormData, setJuntaFormData] = useState<Partial<JuntaDeCurso>>({
        classId: '',
        trimester: 1,
        date: new Date().toISOString().split('T')[0],
        startTime: '13:00',
        endTime: '15:00',
        academicYear: '2025-2026',
        status: 'Planned'
    });

    // Derived Data
    const selectedJunta = useMemo(() => juntas.find(j => j.id === selectedJuntaId), [juntas, selectedJuntaId]);
    const selectedClass = useMemo(() => classes.find(c => c.id === selectedJunta?.classId), [classes, selectedJunta]);
    
    // AUTOMATIC LINKING LOGIC:
    // Finds reports that match the Class and Trimester of the selected Junta.
    const relevantReports = useMemo(() => {
        if (!selectedJunta) return [];
        return reports.filter(r => r.classId === selectedJunta.classId && r.trimester === selectedJunta.trimester);
    }, [reports, selectedJunta]);

    // Teacher specific: Find subject they teach in this class
    const mySubjectInClass = useMemo(() => {
        if (!currentUser || !selectedJunta) return null;
        return subjects.find(s => s.teacherId === currentUser.id); 
    }, [subjects, currentUser, selectedJunta]);

    // Filtering Juntas for Teachers
    const displayedJuntas = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === Role.Vicerrector || currentUser.role === Role.InstitutionAdmin) {
            return juntas;
        }
        if (currentUser.role === Role.Teacher) {
            // Show juntas for classes the teacher is assigned to
            return juntas.filter(j => currentUser.classIds?.includes(j.classId));
        }
        return [];
    }, [juntas, currentUser, subjects, classes]);

    // --- Junta Management Functions ---

    const handleOpenJuntaForm = (juntaToEdit?: JuntaDeCurso) => {
        if (juntaToEdit) {
            setJuntaFormData(juntaToEdit);
        } else {
            setJuntaFormData({
                id: undefined,
                classId: classes[0]?.id || '',
                trimester: 1,
                date: new Date().toISOString().split('T')[0],
                startTime: '13:00',
                endTime: '15:00',
                academicYear: '2025-2026',
                status: 'Planned'
            });
        }
        setIsJuntaFormOpen(true);
    };

    const handleSaveJunta = (e: React.FormEvent) => {
        e.preventDefault();
        if (!juntaFormData.classId) return;

        if (juntaFormData.id) {
            // Edit existing
            setJuntas(prev => prev.map(j => j.id === juntaFormData.id ? { ...j, ...juntaFormData } as JuntaDeCurso : j));
        } else {
            // Create new
            const newJunta: JuntaDeCurso = {
                ...juntaFormData as JuntaDeCurso,
                id: `junta-${Date.now()}`,
                institutionId: currentUser?.institutionId || '',
                reportIds: [] // Initial empty list, populated dynamically by logic
            };
            setJuntas(prev => [...prev, newJunta]);
        }
        setIsJuntaFormOpen(false);
    };

    // --- Report Management Functions ---

    const handleOpenReportForm = (report: SubjectReport | null) => {
        setEditingReport(report);
        setIsReportFormOpen(true);
    };

    const handleSaveReport = (report: SubjectReport) => {
        if (reports.some(r => r.id === report.id)) {
            setReports(reports.map(r => r.id === report.id ? report : r));
        } else {
            setReports([...reports, report]);
        }
        setIsReportFormOpen(false);
    };
    
    const handleApproveReport = (reportId: string) => {
        setReports(reports.map(r => r.id === reportId ? { ...r, status: 'Approved' } : r));
    };

    // Render list of Juntas
    const renderJuntaList = () => (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Juntas de Curso Programadas</h3>
                {(currentUser?.role === Role.Vicerrector || currentUser?.role === Role.InstitutionAdmin) && (
                    <button onClick={() => handleOpenJuntaForm()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">
                        <PlusIcon className="h-4 w-4" /> Nueva Junta
                    </button>
                )}
            </div>
            {displayedJuntas.length === 0 && <p className="text-gray-500 italic">No hay juntas programadas para tus clases.</p>}
            {displayedJuntas.map(junta => {
                const className = classes.find(c => c.id === junta.classId)?.name;
                // Calculate stats for this specific junta
                const relatedReports = reports.filter(r => r.classId === junta.classId && r.trimester === junta.trimester);
                const approvedCount = relatedReports.filter(r => r.status === 'Approved').length;
                const totalSubjects = subjects.length; // Approximate, ideally filter subjects by class level

                return (
                    <div key={junta.id} onClick={() => setSelectedJuntaId(junta.id)} className="bg-white p-4 rounded-lg shadow-sm border hover:border-primary-400 cursor-pointer flex justify-between items-center group">
                        <div>
                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                Junta Trimestre {junta.trimester} - {className}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${junta.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{junta.status}</span>
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <CalendarIcon className="h-3 w-3" />
                                {new Date(junta.date).toLocaleDateString()} • {junta.startTime} - {junta.endTime}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="text-right">
                                 <p className="text-xs font-bold text-gray-600">Informes</p>
                                 <p className="text-sm font-medium text-gray-800">
                                     <span className={approvedCount === relatedReports.length && relatedReports.length > 0 ? "text-green-600" : "text-orange-600"}>
                                        {approvedCount} Aprobados
                                     </span>
                                     <span className="text-gray-400 mx-1">/</span>
                                     {relatedReports.length} Recibidos
                                 </p>
                             </div>
                             <span className="text-primary-600 group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderJuntaDetails = () => {
        if (!selectedJunta || !selectedClass) return null;
        
        const canManageJunta = currentUser?.role === Role.Vicerrector || currentUser?.role === Role.InstitutionAdmin;
        const canSubmitReport = currentUser?.role === Role.Teacher;

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <button onClick={() => setSelectedJuntaId(null)} className="text-xs text-primary-600 hover:underline mb-1">&larr; Volver a la lista</button>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            Gestión de Junta: {selectedClass.name} (T{selectedJunta.trimester})
                            {canManageJunta && (
                                <button onClick={() => handleOpenJuntaForm(selectedJunta)} className="p-1 text-gray-400 hover:text-blue-600" title="Editar Detalles de la Junta">
                                    <EditIcon className="h-4 w-4" />
                                </button>
                            )}
                        </h2>
                        <p className="text-sm text-gray-500">{new Date(selectedJunta.date).toLocaleDateString()} | {selectedJunta.startTime} - {selectedJunta.endTime}</p>
                    </div>
                    <div className="flex gap-2">
                        {canManageJunta && (
                            <button onClick={() => setIsActaPrintOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-sm">
                                <PrinterIcon className="h-4 w-4" /> Generar Acta
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <h4 className="font-bold text-orange-800 text-sm">Informes Recibidos</h4>
                        <p className="text-2xl font-bold text-orange-600">{relevantReports.length}</p>
                        <p className="text-xs text-orange-700">De un total de asignaturas</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h4 className="font-bold text-green-800 text-sm">Informes Aprobados</h4>
                        <p className="text-2xl font-bold text-green-600">{relevantReports.filter(r => r.status === 'Approved').length}</p>
                        <p className="text-xs text-green-700">Listos para el acta</p>
                    </div>
                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-800 text-sm">Estado Junta</h4>
                        <p className="text-xl font-bold text-blue-600 uppercase mt-1">{selectedJunta.status}</p>
                    </div>
                </div>

                {/* Teacher Action Area */}
                {canSubmitReport && mySubjectInClass && (
                    <div className="bg-white border rounded-lg p-4 shadow-sm border-l-4 border-l-primary-500">
                        <h3 className="font-bold text-gray-800 mb-2">Mi Informe de Asignatura: {mySubjectInClass.name}</h3>
                        {(() => {
                            const myReport = relevantReports.find(r => r.teacherId === currentUser.id && r.subjectId === mySubjectInClass.id);
                            if (myReport) {
                                return (
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                                        <div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${myReport.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {myReport.status === 'Approved' ? 'Aprobado' : 'Enviado / En Revisión'}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">Última actualización: {myReport.submissionDate ? new Date(myReport.submissionDate).toLocaleDateString() : '-'}</p>
                                        </div>
                                        <button onClick={() => handleOpenReportForm(myReport)} className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
                                            <EditIcon className="h-4 w-4"/> Editar Informe
                                        </button>
                                    </div>
                                )
                            } else {
                                return (
                                    <button onClick={() => handleOpenReportForm(null)} className="w-full py-3 border-2 border-dashed border-primary-300 rounded-lg text-primary-600 font-semibold hover:bg-primary-50 flex justify-center items-center gap-2">
                                        <PlusIcon className="h-5 w-5" /> Crear Informe de Asignatura
                                    </button>
                                )
                            }
                        })()}
                    </div>
                )}

                {/* Report Grid (Viewable by Vicerrector/Tutor) */}
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-700 border-b pb-2 flex justify-between items-center">
                        <span>Informes por Asignatura</span>
                        <span className="text-xs font-normal text-gray-500">Los informes se vinculan automáticamente por clase y trimestre.</span>
                    </h3>
                    
                    {relevantReports.length === 0 && <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">Aún no se han recibido informes para esta junta.</div>}
                    
                    <div className="grid grid-cols-1 gap-3">
                        {relevantReports.map(report => (
                            <div key={report.id} className="flex justify-between items-center p-3 bg-white border rounded hover:bg-gray-50 shadow-sm">
                                <div>
                                    <p className="font-bold text-sm text-gray-800">{subjects.find(s => s.id === report.subjectId)?.name || 'Asignatura'}</p>
                                    <p className="text-xs text-gray-500">{users.find(u => u.id === report.teacherId)?.name || 'Docente'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-1 rounded font-semibold ${report.status === 'Approved' ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'}`}>
                                        {report.status === 'Approved' ? 'Aprobado' : 'Revisión'}
                                    </span>
                                    
                                    {canManageJunta && report.status === 'Submitted' && (
                                        <button onClick={() => handleApproveReport(report.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center gap-1 shadow-sm">
                                            <CheckCircleIcon className="h-3 w-3" /> Aprobar
                                        </button>
                                    )}
                                    
                                    <button onClick={() => handleOpenReportForm(report)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50" title="Ver Detalles">
                                        <ClipboardListIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {selectedJuntaId ? renderJuntaDetails() : renderJuntaList()}
            
            {/* Modal for Creating/Editing Junta */}
            {isJuntaFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsJuntaFormOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold text-gray-800">{juntaFormData.id ? 'Editar Junta' : 'Programar Nueva Junta'}</h3>
                            <button onClick={() => setIsJuntaFormOpen(false)} className="text-gray-500 hover:text-gray-800"><CloseIcon className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSaveJunta} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clase / Grado</label>
                                <select 
                                    className="w-full p-2 border rounded-md" 
                                    value={juntaFormData.classId} 
                                    onChange={e => setJuntaFormData({...juntaFormData, classId: e.target.value})}
                                    required
                                    disabled={!!juntaFormData.id} // Disable changing class if editing to avoid link breakage
                                >
                                    <option value="">Seleccionar Clase...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre</label>
                                    <select 
                                        className="w-full p-2 border rounded-md" 
                                        value={juntaFormData.trimester} 
                                        onChange={e => setJuntaFormData({...juntaFormData, trimester: parseInt(e.target.value) as 1|2|3})}
                                    >
                                        <option value={1}>Trimestre 1</option>
                                        <option value={2}>Trimestre 2</option>
                                        <option value={3}>Trimestre 3</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select 
                                        className="w-full p-2 border rounded-md" 
                                        value={juntaFormData.status} 
                                        onChange={e => setJuntaFormData({...juntaFormData, status: e.target.value as any})}
                                    >
                                        <option value="Planned">Programada</option>
                                        <option value="ReadyToMeet">Lista para Reunión</option>
                                        <option value="Completed">Finalizada</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de la Reunión</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border rounded-md" 
                                    value={juntaFormData.date} 
                                    onChange={e => setJuntaFormData({...juntaFormData, date: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                                    <input 
                                        type="time" 
                                        className="w-full p-2 border rounded-md" 
                                        value={juntaFormData.startTime} 
                                        onChange={e => setJuntaFormData({...juntaFormData, startTime: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                                    <input 
                                        type="time" 
                                        className="w-full p-2 border rounded-md" 
                                        value={juntaFormData.endTime} 
                                        onChange={e => setJuntaFormData({...juntaFormData, endTime: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                                <button type="button" onClick={() => setIsJuntaFormOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 text-sm">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-bold">Guardar Junta</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isReportFormOpen && currentUser && (
                <SubjectReportForm
                    isOpen={isReportFormOpen}
                    onClose={() => setIsReportFormOpen(false)}
                    onSave={handleSaveReport}
                    reportToEdit={editingReport}
                    classId={selectedJunta!.classId}
                    subjectId={editingReport?.subjectId || mySubjectInClass?.id || subjects[0].id} 
                    teacherId={currentUser.id}
                    students={students.filter(s => s.classId === selectedJunta!.classId)}
                    dcds={[{id: 'dcd1', code: 'M.3.1.4', description: 'Leer y escribir números...', subjectId: 'subj1'} as any]} 
                    currentUser={currentUser}
                    classes={classes}
                    subjects={subjects}
                    gradebooks={gradebooks}
                    microPlans={microPlans}
                    reinforcementPlans={reinforcementPlans}
                />
            )}

            {isActaPrintOpen && selectedJunta && selectedClass && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Vista Previa del Acta</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsActaPrintOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm"><PrinterIcon className="h-5 w-5" /> Imprimir</button>
                            </div>
                        </header>
                        <div className="overflow-y-auto bg-gray-100 p-4">
                            <PrintableJuntaActa 
                                junta={selectedJunta}
                                reports={relevantReports}
                                students={students.filter(s => s.classId === selectedJunta.classId)}
                                users={users}
                                classInfo={selectedClass}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default JuntaManager;
