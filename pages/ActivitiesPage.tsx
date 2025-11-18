
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MOCK_CLASSES, MOCK_USERS, EVALUATION_CATEGORIES, MOCK_GRADEBOOKS } from '../constants';
import { Role, Activity, ActivityType, Class, Subject, Student, Gradebook, StudentGradebook, GradeEntry, TrimesterRecord, EvaluationCategory, User, MicroPlan, Dcd } from '../types';
import { EditIcon, TrashIcon, PlusIcon, CloseIcon, CheckCircleIcon } from '../components/icons/Icons';

interface ActivityFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (activity: Omit<Activity, 'id' | 'institutionId' | 'teacherId'>, id?: string) => void;
    activityToEdit: Activity | null;
    classes: Class[];
    subjects: Subject[];
    microPlans: MicroPlan[];
    dcds: Dcd[];
}

const ActivityForm: React.FC<ActivityFormProps> = ({ isOpen, onClose, onSave, activityToEdit, classes, subjects, microPlans, dcds }) => {
    const [formData, setFormData] = useState({
        classId: '', subjectId: '', title: '', description: '', type: ActivityType.Homework,
        deliveryDate: new Date().toISOString().split('T')[0],
        trimester: '1' as '1' | '2' | '3',
        evaluationCategory: 'ACTIVIDAD_INDIVIDUAL' as EvaluationCategory,
        gradebookIndex: '0' as '0'|'1'|'2'|'3'|'4',
        microPlanId: '',
        dcdId: '',
        duaPrinciple: '' as 'representation' | 'actionExpression' | 'engagement' | '',
    });

    useEffect(() => {
        if (activityToEdit) {
            setFormData({
                classId: activityToEdit.classId,
                subjectId: activityToEdit.subjectId,
                title: activityToEdit.title,
                description: activityToEdit.description,
                type: activityToEdit.type,
                deliveryDate: activityToEdit.deliveryDate,
                trimester: String(activityToEdit.trimester) as '1'|'2'|'3',
                evaluationCategory: activityToEdit.evaluationCategory,
                gradebookIndex: String(activityToEdit.gradebookIndex || '0') as '0'|'1'|'2'|'3'|'4',
                microPlanId: activityToEdit.microPlanId || '',
                dcdId: activityToEdit.dcdId || '',
                duaPrinciple: activityToEdit.duaPrinciple || '',
            });
        } else {
             setFormData({
                classId: '', subjectId: '', title: '', description: '', type: ActivityType.Homework,
                deliveryDate: new Date().toISOString().split('T')[0],
                trimester: '1' as '1' | '2' | '3',
                evaluationCategory: 'ACTIVIDAD_INDIVIDUAL' as EvaluationCategory,
                gradebookIndex: '0' as '0'|'1'|'2'|'3'|'4',
                microPlanId: '',
                dcdId: '',
                duaPrinciple: '',
            });
        }
    }, [activityToEdit, isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            trimester: parseInt(formData.trimester) as 1 | 2 | 3,
            gradebookIndex: formData.evaluationCategory.startsWith('ACTIVIDAD') ? parseInt(formData.gradebookIndex) as 0|1|2|3|4 : undefined,
            microPlanId: formData.microPlanId || undefined,
            dcdId: formData.dcdId || undefined,
            duaPrinciple: formData.duaPrinciple as 'representation' | 'actionExpression' | 'engagement' || undefined,
        }, activityToEdit?.id);
    };
    
    const relevantMicroPlans = useMemo(() => {
        if (!formData.classId || !formData.subjectId) return [];
        return microPlans.filter(mp => mp.classId === formData.classId && mp.subjectId === formData.subjectId);
    }, [formData.classId, formData.subjectId, microPlans]);

    const relevantDcds = useMemo(() => {
        if (!formData.microPlanId) return [];
        const plan = microPlans.find(p => p.id === formData.microPlanId);
        if (!plan) return [];
        return dcds.filter(d => plan.dcdIds.includes(d.id));
    }, [formData.microPlanId, microPlans, dcds]);
    
    const selectedDcd = dcds.find(d => d.id === formData.dcdId);

    const isFormative = formData.evaluationCategory === 'ACTIVIDAD_INDIVIDUAL' || formData.evaluationCategory === 'ACTIVIDAD_GRUPAL';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{activityToEdit ? 'Editar' : 'Crear'} Actividad</h2>
                    <button onClick={onClose} className="p-1"><CloseIcon className="h-6 w-6" /></button>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
                    <input type="text" value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} placeholder="Título de la Actividad" required className="w-full p-2 border rounded"/>
                    <textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="Descripción..." required rows={2} className="w-full p-2 border rounded"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select value={formData.classId} onChange={e => setFormData(p => ({...p, classId: e.target.value}))} required className="w-full p-2 border rounded"><option value="">Clase</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        <select value={formData.subjectId} onChange={e => setFormData(p => ({...p, subjectId: e.target.value}))} required className="w-full p-2 border rounded"><option value="">Asignatura</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                        <input type="date" value={formData.deliveryDate} onChange={e => setFormData(p => ({...p, deliveryDate: e.target.value}))} required className="w-full p-2 border rounded"/>
                        <select value={formData.type} onChange={e => setFormData(p => ({...p, type: e.target.value as ActivityType}))} required className="w-full p-2 border rounded">{Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}</select>
                    </div>

                    <fieldset className="border p-4 rounded-md bg-blue-50 border-blue-200">
                        <legend className="font-semibold px-2 text-blue-800">Vinculación Curricular (PUD/DUA)</legend>
                        <div className="space-y-3">
                             <select value={formData.microPlanId} onChange={e => setFormData(p => ({...p, microPlanId: e.target.value, dcdId: ''}))} className="w-full p-2 border rounded bg-white" disabled={!formData.classId || !formData.subjectId}>
                                <option value="">Seleccionar Unidad de Planificación (PUD)</option>
                                {relevantMicroPlans.map(mp => <option key={mp.id} value={mp.id}>{mp.unitTitle}</option>)}
                            </select>
                            <select value={formData.dcdId} onChange={e => setFormData(p => ({...p, dcdId: e.target.value}))} className="w-full p-2 border rounded bg-white" disabled={!formData.microPlanId}>
                                <option value="">Seleccionar Destreza (DCD)</option>
                                {relevantDcds.map(d => <option key={d.id} value={d.id}>{d.code} - {d.description.substring(0, 60)}...</option>)}
                            </select>
                            {selectedDcd && (
                                <div className="text-xs bg-white p-2 rounded border text-gray-600">
                                    <strong>Destreza Completa:</strong> {selectedDcd.description}
                                    {selectedDcd.isDisaggregated && <span className="block text-yellow-600 font-semibold mt-1">Destreza Desagregada</span>}
                                </div>
                            )}
                            <select value={formData.duaPrinciple} onChange={e => setFormData(p => ({...p, duaPrinciple: e.target.value as any}))} className="w-full p-2 border rounded bg-white">
                                <option value="">Seleccionar Principio DUA (Metodología)</option>
                                <option value="representation">1. Representación (El Qué)</option>
                                <option value="actionExpression">2. Acción y Expresión (El Cómo)</option>
                                <option value="engagement">3. Implicación (El Por Qué)</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset className="border p-4 rounded-md">
                        <legend className="font-semibold px-2">Vinculación con Registro Docente</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select name="trimester" value={formData.trimester} onChange={e => setFormData(p => ({...p, trimester: e.target.value as '1'|'2'|'3'}))} required className="w-full p-2 border rounded"><option value="1">Trimestre 1</option><option value="2">Trimestre 2</option><option value="3">Trimestre 3</option></select>
                            <select name="evaluationCategory" value={formData.evaluationCategory} onChange={e => setFormData(p => ({...p, evaluationCategory: e.target.value as EvaluationCategory}))} required className="w-full p-2 border rounded">{Object.entries(EVALUATION_CATEGORIES).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select>
                            {isFormative && <select name="gradebookIndex" value={formData.gradebookIndex} onChange={e => setFormData(p => ({...p, gradebookIndex: e.target.value as any}))} required className="w-full p-2 border rounded">{[...Array(5).keys()].map(i => <option key={i} value={i}>Índice de Actividad {i + 1}</option>)}</select>}
                        </div>
                    </fieldset>
                    <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Guardar</button></div>
                </form>
            </div>
        </div>
    );
};

const GradeDisplay: React.FC<{ grade?: number }> = ({ grade }) => (
    <span className="font-bold text-gray-800">{grade !== undefined ? grade.toFixed(2) : '-'}</span>
);

const ActivityCard: React.FC<{ activity: Activity; classInfo?: Class; grade?: GradeEntry; dcd?: Dcd }> = ({ activity, classInfo, grade, dcd }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col h-full relative">
             {activity.duaPrinciple && (
                <div className="absolute top-2 right-2" title="Principio DUA">
                    {activity.duaPrinciple === 'representation' && <span className="w-3 h-3 rounded-full bg-blue-500 block"></span>}
                    {activity.duaPrinciple === 'actionExpression' && <span className="w-3 h-3 rounded-full bg-green-500 block"></span>}
                    {activity.duaPrinciple === 'engagement' && <span className="w-3 h-3 rounded-full bg-purple-500 block"></span>}
                </div>
            )}
            <div className="flex justify-between items-start pr-4">
                <div>
                    <p className="text-xs text-gray-500">{classInfo?.name}</p>
                    <h4 className="font-bold text-gray-800 text-sm">{activity.title}</h4>
                </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 flex-grow">{activity.description}</p>
            {dcd && <p className="text-[10px] text-gray-500 mt-2 bg-gray-50 p-1 rounded border border-gray-100"><strong>DCD:</strong> {dcd.code}</p>}
            <div className="mt-auto pt-3 border-t">
                <p className="text-xs font-semibold text-gray-700 mb-2">Entrega: {new Date(activity.deliveryDate).toLocaleDateString()}</p>
                {grade && (
                    <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                        <div className="flex justify-between"><span>Nota:</span> <GradeDisplay grade={grade.nota} /></div>
                        {grade.mejora !== undefined && <div className="flex justify-between text-blue-600"><span>Mejora:</span> <GradeDisplay grade={grade.mejora} /></div>}
                        <div className="flex justify-between font-bold border-t border-gray-300 pt-1 mt-1"><span>Final:</span> <GradeDisplay grade={grade.promedio} /></div>
                    </div>
                )}
            </div>
        </div>
    );
};

const createEmptyGradebook = (institutionId: string, classId: string, subjectId: string, studentIds: string[]): Gradebook => {
    const createEmptyTrimester = (): TrimesterRecord => ({
        actividades: Array(5).fill(null).map(() => ({ promedio: 0, activityId: undefined })),
        portafolio: { promedio: 0 },
        evaluacionSumativa: { promedio: 0 },
        proyectoIntegrador: { promedio: 0 },
        promedioFormativas: 0,
        sumaTrimestre: 0,
    });
    const createEmptyStudentGradebook = (studentId: string): StudentGradebook => ({
        studentId,
        trimester1: createEmptyTrimester(),
        trimester2: createEmptyTrimester(),
        trimester3: createEmptyTrimester(),
        mejorasUtilizadas: 0,
        promedioTrimestralFinal: 0,
        notaAnual90: 0,
        proyectoFinal10: { promedio: 0 },
        notaFinal100: 0,
        observacionFinal: 'Pendiente'
    });
    return {
        id: `gb-${classId}-${subjectId}`,
        institutionId, classId, subjectId,
        records: studentIds.map(createEmptyStudentGradebook)
    };
};

interface ActivitiesPageProps {
    activities: Activity[];
    onUpdateActivities: (activities: Activity[]) => void;
    classes: Class[];
    subjects: Subject[];
    students: Student[];
    gradebooks: Gradebook[];
    onUpdateGradebooks: (gradebooks: Gradebook[]) => void;
    users: User[];
    microPlans: MicroPlan[];
    dcds: Dcd[];
}

interface ActivityGradebookModalProps {
    isOpen: boolean;
    onClose: () => void;
    activity: Activity;
    students: Student[];
    gradebook: Gradebook | undefined;
    onSaveGrades: (updatedGradebook: Gradebook) => void;
}

const ActivityGradebookModal: React.FC<ActivityGradebookModalProps> = ({ isOpen, onClose, activity, students, gradebook, onSaveGrades }) => {
    const [localGrades, setLocalGrades] = useState<Record<string, Partial<GradeEntry>>>({});

    useEffect(() => {
        if (isOpen && gradebook) {
            const initialGrades: Record<string, Partial<GradeEntry>> = {};
            gradebook.records.forEach(studentRecord => {
                const trimesterKey = `trimester${activity.trimester}` as const;
                const trimester = studentRecord[trimesterKey];
                let gradeEntry: GradeEntry | undefined;

                if (activity.evaluationCategory.startsWith('ACTIVIDAD') && activity.gradebookIndex !== undefined) {
                    gradeEntry = trimester.actividades[activity.gradebookIndex];
                } else if (activity.evaluationCategory === 'PORTAFOLIO') {
                    gradeEntry = trimester.portafolio;
                } else if (activity.evaluationCategory === 'EVALUACION_SUMATIVA') {
                    gradeEntry = trimester.evaluacionSumativa;
                } else if (activity.evaluationCategory === 'PROYECTO_INTEGRADOR') {
                    gradeEntry = trimester.proyectoIntegrador;
                }
                
                if (gradeEntry) {
                    initialGrades[studentRecord.studentId] = {
                        nota: gradeEntry.nota,
                        mejora: gradeEntry.mejora,
                        refuerzo: gradeEntry.refuerzo
                    };
                }
            });
            setLocalGrades(initialGrades);
        }
    }, [isOpen, gradebook, activity]);

    const handleGradeChange = (studentId: string, field: 'nota' | 'mejora' | 'refuerzo', value: string) => {
        const numValue = value === '' ? undefined : parseFloat(value);
        setLocalGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: numValue
            }
        }));
    };

    const handleSave = () => {
        if (!gradebook) return;

        const updatedGradebook = JSON.parse(JSON.stringify(gradebook));

        updatedGradebook.records.forEach((studentRecord: StudentGradebook) => {
            const studentGrades = localGrades[studentRecord.studentId];
            if (studentGrades) {
                const trimesterKey = `trimester${activity.trimester}` as const;
                const trimester = studentRecord[trimesterKey];
                let gradeEntryRef: GradeEntry | undefined;

                 if (activity.evaluationCategory.startsWith('ACTIVIDAD') && activity.gradebookIndex !== undefined) {
                    gradeEntryRef = trimester.actividades[activity.gradebookIndex];
                } else if (activity.evaluationCategory === 'PORTAFOLIO') {
                    gradeEntryRef = trimester.portafolio;
                } else if (activity.evaluationCategory === 'EVALUACION_SUMATIVA') {
                    gradeEntryRef = trimester.evaluacionSumativa;
                } else if (activity.evaluationCategory === 'PROYECTO_INTEGRADOR') {
                    gradeEntryRef = trimester.proyectoIntegrador;
                }
                
                if (gradeEntryRef) {
                    gradeEntryRef.nota = studentGrades.nota;
                    gradeEntryRef.mejora = studentGrades.mejora;
                    gradeEntryRef.refuerzo = studentGrades.refuerzo;
                    // Simple recalculation of average for display
                    gradeEntryRef.promedio = studentGrades.refuerzo ?? studentGrades.mejora ?? studentGrades.nota ?? 0;
                }
            }
        });

        onSaveGrades(updatedGradebook);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">Calificar Actividad</h2>
                        <p className="text-sm text-gray-500">{activity.title}</p>
                    </div>
                    <button onClick={onClose}><CloseIcon className="h-6 w-6" /></button>
                </header>
                <main className="overflow-y-auto pr-2">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nota</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mejora</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Refuerzo</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map(student => {
                                const grades = localGrades[student.id] || {};
                                const promedio = grades.refuerzo ?? grades.mejora ?? grades.nota ?? 0;
                                return (
                                    <tr key={student.id}>
                                        <td className="px-4 py-2 text-sm font-medium">{student.name}</td>
                                        <td><input type="number" step="0.01" min="0" max="10" value={grades.nota ?? ''} onChange={e => handleGradeChange(student.id, 'nota', e.target.value)} className="w-20 p-1 border rounded"/></td>
                                        <td><input type="number" step="0.01" min="0" max="10" value={grades.mejora ?? ''} onChange={e => handleGradeChange(student.id, 'mejora', e.target.value)} className="w-20 p-1 border rounded"/></td>
                                        <td><input type="number" step="0.01" min="0" max="10" value={grades.refuerzo ?? ''} onChange={e => handleGradeChange(student.id, 'refuerzo', e.target.value)} className="w-20 p-1 border rounded"/></td>
                                        <td className="px-4 py-2 text-sm font-bold">{promedio.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </main>
                <footer className="flex justify-end gap-2 pt-4 mt-auto border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded">Guardar Calificaciones</button>
                </footer>
            </div>
        </div>
    );
};

const TeacherActivities: React.FC<ActivitiesPageProps> = (props) => {
    const { user } = useContext(UserContext);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
    const [gradingActivity, setGradingActivity] = useState<Activity | null>(null);

    const institutionClasses = useMemo(() => props.classes.filter(c => c.institutionId === user?.institutionId), [props.classes, user]);
    const teacherSubjects = useMemo(() => props.subjects.filter(s => s.teacherId === user?.id), [props.subjects, user]);
    
    const teacherActivities = useMemo(() => 
        props.activities.filter(act => act.teacherId === user?.id && act.institutionId === user?.institutionId), 
        [user, props.activities]
    );

    const handleSave = (activityData: Omit<Activity, 'id' | 'institutionId' | 'teacherId'>, id?: string) => {
        let updatedActivities;
        const newActivityId = id || `act-${Date.now()}`;
        const finalActivity: Activity = { ...activityData, id: newActivityId, institutionId: user!.institutionId!, teacherId: user!.id };

        if (id) {
            updatedActivities = props.activities.map(a => a.id === id ? finalActivity : a);
        } else {
            updatedActivities = [...props.activities, finalActivity];
        }
        props.onUpdateActivities(updatedActivities);

        // --- Gradebook Logic ---
        let gradebook = props.gradebooks.find(gb => gb.classId === finalActivity.classId && gb.subjectId === finalActivity.subjectId);
        let updatedGradebooks = [...props.gradebooks];

        if (!gradebook) {
            const studentIdsInClass = props.classes.find(c => c.id === finalActivity.classId)?.studentIds || [];
            gradebook = createEmptyGradebook(user!.institutionId!, finalActivity.classId, finalActivity.subjectId, studentIdsInClass);
            updatedGradebooks.push(gradebook);
        }

        const finalGradebook = JSON.parse(JSON.stringify(gradebook));

        finalGradebook.records.forEach((studentRecord: StudentGradebook) => {
            const trimesterKey = `trimester${finalActivity.trimester}` as const;
            const trimester = studentRecord[trimesterKey];
            
            if (finalActivity.evaluationCategory.startsWith('ACTIVIDAD') && finalActivity.gradebookIndex !== undefined) {
                trimester.actividades[finalActivity.gradebookIndex].activityId = finalActivity.id;
            } else if (finalActivity.evaluationCategory === 'PORTAFOLIO') {
                trimester.portafolio.activityId = finalActivity.id;
            } else if (finalActivity.evaluationCategory === 'EVALUACION_SUMATIVA') {
                trimester.evaluacionSumativa.activityId = finalActivity.id;
            } else if (finalActivity.evaluationCategory === 'PROYECTO_INTEGRADOR') {
                trimester.proyectoIntegrador.activityId = finalActivity.id;
            }
        });
        
        props.onUpdateGradebooks(updatedGradebooks.map(gb => gb.id === finalGradebook.id ? finalGradebook : gb));
        // --- End Gradebook Logic ---

        setIsFormOpen(false);
    };
    
    const handleDelete = (activityId: string) => {
        if (window.confirm('¿Seguro que quiere eliminar esta actividad?')) {
            props.onUpdateActivities(props.activities.filter(a => a.id !== activityId));
        }
    };
    
    const handleSaveGrades = (updatedGradebook: Gradebook) => {
        props.onUpdateGradebooks(props.gradebooks.map(gb => gb.id === updatedGradebook.id ? updatedGradebook : gb));
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Gestionar Actividades</h2>
                <button onClick={() => { setActivityToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    <PlusIcon className="h-5 w-5" />Crear Actividad
                </button>
            </div>
             <div className="space-y-4">
                {teacherActivities.map(activity => (
                    <div key={activity.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                        <div>
                             <p className="text-sm text-gray-500">{institutionClasses.find(c => c.id === activity.classId)?.name}</p>
                             <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-800">{activity.title}</h4>
                                {activity.dcdId && <span className="text-[10px] bg-gray-100 border border-gray-300 px-1 rounded text-gray-600">DCD</span>}
                                {activity.duaPrinciple && <span className="text-[10px] bg-blue-100 border border-blue-300 px-1 rounded text-blue-800">DUA</span>}
                             </div>
                             <p className="text-sm font-semibold text-gray-700 mt-1">Entrega: {new Date(activity.deliveryDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setGradingActivity(activity)} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md font-semibold hover:bg-blue-200">Calificar</button>
                             <button onClick={() => { setActivityToEdit(activity); setIsFormOpen(true); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full"><EditIcon className="h-5 w-5" /></button>
                            <button onClick={() => handleDelete(activity.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                    </div>
                ))}
            </div>
            {isFormOpen && <ActivityForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSave} activityToEdit={activityToEdit} classes={institutionClasses} subjects={teacherSubjects} microPlans={props.microPlans} dcds={props.dcds} />}
            {gradingActivity && (
                <ActivityGradebookModal
                    isOpen={!!gradingActivity}
                    onClose={() => setGradingActivity(null)}
                    activity={gradingActivity}
                    students={props.students.filter(s => s.classId === gradingActivity.classId)}
                    gradebook={props.gradebooks.find(gb => gb.classId === gradingActivity.classId && gb.subjectId === gradingActivity.subjectId)}
                    onSaveGrades={handleSaveGrades}
                />
            )}
        </div>
    );
};

const StudentParentActivities: React.FC<ActivitiesPageProps> = (props) => {
    const { user } = useContext(UserContext);

    const institutionClasses = useMemo(() => props.classes.filter(c => c.institutionId === user?.institutionId), [props.classes, user]);
    const studentId = user?.role === Role.Student ? user.id : user?.childId;

    const relevantClassIds = useMemo(() => {
        if (!user || !studentId) return [];
        const studentUser = props.students.find(u => u.id === studentId);
        return studentUser ? [studentUser.classId] : [];
    }, [user, studentId, props.students]);

    const activities = useMemo(() =>
        props.activities.filter(act => act.institutionId === user?.institutionId && relevantClassIds.includes(act.classId)),
        [relevantClassIds, user, props.activities]
    );
    
    const studentGradebookRecords = useMemo(() => {
        if (!studentId) return new Map();
        const records = new Map<string, GradeEntry>();
        props.gradebooks.forEach(gb => {
            const studentRecord = gb.records.find(r => r.studentId === studentId);
            if (studentRecord) {
                const trimesters = [studentRecord.trimester1, studentRecord.trimester2, studentRecord.trimester3];
                trimesters.forEach(trim => {
                    trim.actividades.forEach(act => { if(act.activityId) records.set(act.activityId, act) });
                    if(trim.portafolio.activityId) records.set(trim.portafolio.activityId, trim.portafolio);
                    if(trim.evaluacionSumativa.activityId) records.set(trim.evaluacionSumativa.activityId, trim.evaluacionSumativa);
                    if(trim.proyectoIntegrador.activityId) records.set(trim.proyectoIntegrador.activityId, trim.proyectoIntegrador);
                });
                if(studentRecord.proyectoFinal10.activityId) records.set(studentRecord.proyectoFinal10.activityId, studentRecord.proyectoFinal10);
            }
        });
        return records;
    }, [studentId, props.gradebooks]);


    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Próximas Actividades y Calificaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map(activity => {
                    const classInfo = institutionClasses.find(c => c.id === activity.classId);
                    const grade = studentGradebookRecords.get(activity.id);
                    const dcd = props.dcds.find(d => d.id === activity.dcdId);
                    return <ActivityCard key={activity.id} activity={activity} classInfo={classInfo} grade={grade} dcd={dcd} />
                })}
            </div>
        </div>
    );
};

const ActivitiesPage: React.FC<ActivitiesPageProps> = (props) => {
    const { user } = useContext(UserContext);

    if (user?.role === Role.Teacher || user?.role === Role.InstitutionAdmin) {
        return <TeacherActivities {...props} />;
    }

    if (user?.role === Role.Parent || user?.role === Role.Student) {
        return <StudentParentActivities {...props} />;
    }
    
    return <p>No tiene acceso a esta sección.</p>;
};

export default ActivitiesPage;
