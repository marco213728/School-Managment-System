
import React, { useState, useMemo, useContext } from 'react';
import { ChartBarIcon, CheckCircleIcon, AlertTriangleIcon, PlusIcon, PrinterIcon, EditIcon, TrashIcon, CloseIcon } from '../icons/Icons';
import { Gradebook, AttendanceRecord, Student, Subject, Class, QualityGoal, ImprovementPlan, User, AttendanceStatus, Role } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import PrintableQualityReport from '../reports/PrintableQualityReport';

// --- SUB-COMPONENTS ---

// 1. Goal Setting Modal
interface QualityGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: QualityGoal) => void;
    currentGoal?: QualityGoal;
}

const QualityGoalModal: React.FC<QualityGoalModalProps> = ({ isOpen, onClose, onSave, currentGoal }) => {
    const [formData, setFormData] = useState<Partial<QualityGoal>>({
        category: 'Rendimiento',
        metricName: '',
        targetValue: 7.0,
        academicYear: '2024-2025'
    });

    React.useEffect(() => {
        if (currentGoal) setFormData(currentGoal);
        else setFormData({ category: 'Rendimiento', metricName: '', targetValue: 7.0, academicYear: '2024-2025' });
    }, [currentGoal, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Configurar Meta de Calidad (PEI)</h3>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData as QualityGoal); }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Categoría</label>
                            <select 
                                value={formData.category} 
                                onChange={e => setFormData({...formData, category: e.target.value as any})}
                                className="w-full p-2 border rounded"
                            >
                                <option>Rendimiento</option>
                                <option>Asistencia</option>
                                <option>Retención</option>
                                <option>Comportamiento</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nombre del Indicador</label>
                            <input 
                                type="text" 
                                value={formData.metricName} 
                                onChange={e => setFormData({...formData, metricName: e.target.value})}
                                className="w-full p-2 border rounded"
                                placeholder="Ej: Promedio General, Tasa Asistencia"
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Meta / Objetivo</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.targetValue} 
                                onChange={e => setFormData({...formData, targetValue: parseFloat(e.target.value)})}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Valor numérico (Ej: 8.5 para notas, 95 para %)</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// 2. Improvement Plan Form
interface ImprovementPlanFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: ImprovementPlan) => void;
    planToEdit?: ImprovementPlan | null;
    users: User[]; // to select responsible
}

const ImprovementPlanForm: React.FC<ImprovementPlanFormProps> = ({ isOpen, onClose, onSave, planToEdit, users }) => {
    const [formData, setFormData] = useState<Partial<ImprovementPlan>>({
        problemDetected: '',
        proposedIntervention: '',
        status: 'Not Started',
        deadline: ''
    });

    React.useEffect(() => {
        if (planToEdit) setFormData(planToEdit);
        else setFormData({ problemDetected: '', proposedIntervention: '', status: 'Not Started', deadline: '' });
    }, [planToEdit, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4">{planToEdit ? 'Editar' : 'Nuevo'} Plan de Mejora Institucional</h3>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData as ImprovementPlan); }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Problema Detectado (Hallazgo)</label>
                            <textarea 
                                value={formData.problemDetected} 
                                onChange={e => setFormData({...formData, problemDetected: e.target.value})}
                                className="w-full p-2 border rounded"
                                rows={2}
                                required
                                placeholder="Ej: Bajo rendimiento en matemáticas en 8vo grado..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Intervención Propuesta</label>
                            <textarea 
                                value={formData.proposedIntervention} 
                                onChange={e => setFormData({...formData, proposedIntervention: e.target.value})}
                                className="w-full p-2 border rounded"
                                rows={3}
                                required
                                placeholder="Ej: Implementación de talleres de refuerzo y revisión de planificaciones..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Responsable</label>
                                <select 
                                    value={formData.responsibleId} 
                                    onChange={e => setFormData({...formData, responsibleId: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {users.filter(u => u.role === Role.Vicerrector || u.role === Role.InstitutionAdmin || u.role === Role.Teacher).map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Fecha Límite</label>
                                <input 
                                    type="date"
                                    value={formData.deadline} 
                                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium">Estado</label>
                             <select 
                                value={formData.status} 
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                                className="w-full p-2 border rounded"
                            >
                                <option value="Not Started">No Iniciado</option>
                                <option value="In Progress">En Proceso</option>
                                <option value="Completed">Completado</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Guardar Plan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---

interface QualityDashboardProps {
    gradebooks: Gradebook[];
    attendanceRecords: AttendanceRecord[];
    students: Student[];
    subjects: Subject[];
    classes: Class[];
    users: User[];
}

const QualityDashboard: React.FC<QualityDashboardProps> = ({ gradebooks, attendanceRecords, students, subjects, classes, users }) => {
    const { user: currentUser } = useContext(UserContext);
    
    // Local state for goals and plans (simulating DB)
    const [goals, setGoals] = useState<QualityGoal[]>([
        { id: 'g1', institutionId: 'uemol', category: 'Rendimiento', metricName: 'Promedio General', targetValue: 8.0, academicYear: '2024-2025' },
        { id: 'g2', institutionId: 'uemol', category: 'Asistencia', metricName: 'Tasa Global Asistencia', targetValue: 95, academicYear: '2024-2025' }
    ]);
    const [plans, setPlans] = useState<ImprovementPlan[]>([]);
    
    // Modal states
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<ImprovementPlan | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    // --- LOGIC A: Academic Indicators & Performance Levels ---
    const academicStats = useMemo(() => {
        let totalSum = 0;
        let totalCount = 0;
        let passCount = 0;
        const subjectAverages: Record<string, { sum: number, count: number, name: string }> = {};
        
        // Counters for Performance Levels
        let domina = 0; // 9-10
        let alcanza = 0; // 7-8.99
        let proximo = 0; // 4.01-6.99
        let noAlcanza = 0; // <= 4

        gradebooks.forEach(gb => {
            const subject = subjects.find(s => s.id === gb.subjectId);
            const subjectName = subject?.name || 'Desconocido';
            
            if (!subjectAverages[gb.subjectId]) {
                subjectAverages[gb.subjectId] = { sum: 0, count: 0, name: subjectName };
            }

            gb.records.forEach(rec => {
                // Using notaFinal100 or projected average
                const grade = rec.notaFinal100 || rec.promedioTrimestralFinal; 
                if (grade > 0) {
                    totalSum += grade;
                    totalCount++;
                    subjectAverages[gb.subjectId].sum += grade;
                    subjectAverages[gb.subjectId].count++;

                    // Efficiency: Pass Rate
                    if (grade >= 7) passCount++;

                    // Performance Levels
                    if (grade >= 9) domina++;
                    else if (grade >= 7) alcanza++;
                    else if (grade > 4) proximo++;
                    else noAlcanza++;
                }
            });
        });

        const generalAverage = totalCount > 0 ? totalSum / totalCount : 0;
        
        const subjectStats = Object.values(subjectAverages).map(s => ({
            name: s.name,
            average: s.count > 0 ? s.sum / s.count : 0
        })).sort((a,b) => a.average - b.average);

        const performanceLevels = [
            { level: 'Domina los Aprendizajes (DAR)', description: 'Supera el estándar (9.00 - 10.00)', range: '9-10', count: domina, percentage: totalCount > 0 ? (domina/totalCount)*100 : 0 },
            { level: 'Alcanza los Aprendizajes (AAR)', description: 'Cumple el estándar (7.00 - 8.99)', range: '7-8.99', count: alcanza, percentage: totalCount > 0 ? (alcanza/totalCount)*100 : 0 },
            { level: 'Próximo a Alcanzar (PAR)', description: 'Cerca del estándar (4.01 - 6.99)', range: '4.01-6.99', count: proximo, percentage: totalCount > 0 ? (proximo/totalCount)*100 : 0 },
            { level: 'No Alcanza (NAR)', description: 'No cumple estándar (<= 4.00)', range: '<= 4', count: noAlcanza, percentage: totalCount > 0 ? (noAlcanza/totalCount)*100 : 0 },
        ];

        return { generalAverage, subjectStats, performanceLevels, totalCount, passCount };
    }, [gradebooks, subjects]);

    // --- LOGIC B: Retention & Attendance ---
    const efficiencyStats = useMemo(() => {
        if (attendanceRecords.length === 0) return { attendanceRate: 0, retentionRate: 100, passRate: 0 };

        const totalRecords = attendanceRecords.length;
        const presentRecords = attendanceRecords.filter(r => r.status === AttendanceStatus.Present || r.status === AttendanceStatus.Tardy).length;
        const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

        // Retention Rate Calculation (Simplified logic for demo)
        const studentAttendanceCounts: Record<string, { total: number, present: number }> = {};
        attendanceRecords.forEach(r => {
            if (!studentAttendanceCounts[r.studentId]) studentAttendanceCounts[r.studentId] = { total: 0, present: 0 };
            studentAttendanceCounts[r.studentId].total++;
            if (r.status === AttendanceStatus.Present || r.status === AttendanceStatus.Tardy) {
                studentAttendanceCounts[r.studentId].present++;
            }
        });

        const retainedStudents = Object.values(studentAttendanceCounts).filter(s => (s.present / s.total) >= 0.8).length; // < 20% absenteeism as proxy
        const totalActiveStudents = Object.keys(studentAttendanceCounts).length;
        const retentionRate = totalActiveStudents > 0 ? (retainedStudents / totalActiveStudents) * 100 : 100;

        const passRate = academicStats.totalCount > 0 ? (academicStats.passCount / academicStats.totalCount) * 100 : 0;

        return { attendanceRate, retentionRate, passRate };
    }, [attendanceRecords, academicStats.totalCount, academicStats.passCount]);

    // --- TRAFFIC LIGHT UTILS ---
    const getTrafficLight = (value: number, target: number) => {
        if (value >= target) return { color: 'bg-green-100 text-green-800', icon: <CheckCircleIcon className="h-5 w-5 text-green-600" /> };
        if (value >= target * 0.9) return { color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangleIcon className="h-5 w-5 text-yellow-600" /> };
        return { color: 'bg-red-100 text-red-800', icon: <AlertTriangleIcon className="h-5 w-5 text-red-600" /> };
    };

    // --- HANDLERS ---
    const handleSaveGoal = (goal: QualityGoal) => {
        const newGoal = { ...goal, id: `goal-${Date.now()}`, institutionId: currentUser?.institutionId || '' };
        setGoals([...goals, newGoal]);
        setIsGoalModalOpen(false);
    };

    const handleSavePlan = (plan: ImprovementPlan) => {
        if (plan.id) {
            setPlans(plans.map(p => p.id === plan.id ? plan : p));
        } else {
            setPlans([...plans, { ...plan, id: `plan-${Date.now()}`, institutionId: currentUser?.institutionId || '', dateCreated: new Date().toISOString() }]);
        }
        setIsPlanModalOpen(false);
        setEditingPlan(null);
    };

    const handleDeletePlan = (id: string) => {
        if(window.confirm('¿Eliminar este plan?')) setPlans(plans.filter(p => p.id !== id));
    };

    const handleGenerateReport = () => {
        setIsReportOpen(true);
    };

    // Find goals
    const gradeGoal = goals.find(g => g.category === 'Rendimiento')?.targetValue || 7;
    const attendanceGoal = goals.find(g => g.category === 'Asistencia')?.targetValue || 90;

    const gradeStatus = getTrafficLight(academicStats.generalAverage, gradeGoal);
    const attendanceStatus = getTrafficLight(efficiencyStats.attendanceRate, attendanceGoal);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Evaluación y Calidad Educativa</h2>
                    <p className="text-gray-500 text-sm">Monitoreo de Estándares e Indicadores Institucionales (BI)</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsGoalModalOpen(true)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm font-medium hover:bg-gray-50">
                        Configurar Metas (PEI)
                    </button>
                    <button onClick={handleGenerateReport} className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-bold hover:bg-primary-700 flex items-center gap-2">
                        <PrinterIcon className="h-4 w-4"/> Generar Reporte de Calidad
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Academic Performance */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 p-2 ${gradeStatus.color} rounded-bl-xl`}>
                        {gradeStatus.icon}
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Promedio General Académico</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-gray-800">{academicStats.generalAverage.toFixed(2)}</span>
                        <span className="text-gray-500 mb-1 text-sm">/ 10</span>
                    </div>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(academicStats.generalAverage / 10) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Meta Institucional: <strong>{gradeGoal}</strong></p>
                </div>

                {/* Attendance Rate */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 p-2 ${attendanceStatus.color} rounded-bl-xl`}>
                        {attendanceStatus.icon}
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Tasa Global de Asistencia</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-gray-800">{efficiencyStats.attendanceRate.toFixed(1)}%</span>
                    </div>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${efficiencyStats.attendanceRate}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Meta Institucional: <strong>{attendanceGoal}%</strong></p>
                </div>

                {/* Retention Rate */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Tasa de Retención Escolar</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-gray-800">{efficiencyStats.retentionRate.toFixed(1)}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Estudiantes activos y regulares en el sistema.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Performance Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-gray-500"/> Rendimiento por Asignatura (Prioritario)
                    </h3>
                    <div className="space-y-3">
                        {academicStats.subjectStats.slice(0, 5).map((subj, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{subj.name}</span>
                                    <span className={subj.average < 7 ? 'text-red-600 font-bold' : 'text-gray-600'}>{subj.average.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${subj.average < 7 ? 'bg-red-500' : subj.average < 8 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                        style={{ width: `${(subj.average / 10) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Improvement Plans List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Planes de Mejora Institucional</h3>
                        <button onClick={() => { setEditingPlan(null); setIsPlanModalOpen(true); }} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200 flex items-center gap-1">
                            <PlusIcon className="h-3 w-3"/> Nuevo Plan
                        </button>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto max-h-64 space-y-3">
                        {plans.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No hay planes activos.</p>}
                        {plans.map(plan => (
                            <div key={plan.id} className="border p-3 rounded-lg hover:bg-gray-50 group relative">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{plan.problemDetected}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${plan.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {plan.status === 'Not Started' ? 'Pendiente' : plan.status === 'In Progress' ? 'En Proceso' : 'Finalizado'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{plan.proposedIntervention}</p>
                                <p className="text-[10px] text-gray-400 mt-2">Resp: {users.find(u => u.id === plan.responsibleId)?.name} • Vence: {plan.deadline}</p>
                                
                                <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 bg-white p-1 rounded shadow">
                                    <button onClick={() => { setEditingPlan(plan); setIsPlanModalOpen(true); }} className="text-blue-500 hover:text-blue-700"><EditIcon className="h-4 w-4"/></button>
                                    <button onClick={() => handleDeletePlan(plan.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <QualityGoalModal 
                isOpen={isGoalModalOpen} 
                onClose={() => setIsGoalModalOpen(false)} 
                onSave={handleSaveGoal} 
            />

            <ImprovementPlanForm 
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
                onSave={handleSavePlan}
                planToEdit={editingPlan}
                users={users}
            />

            {isReportOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[90] flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Vista Previa del Informe</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsReportOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                    <PrinterIcon className="h-5 w-5" /> Imprimir / PDF
                                </button>
                            </div>
                        </header>
                        <div className="overflow-y-auto bg-gray-100 p-4">
                            <PrintableQualityReport 
                                academicStats={academicStats}
                                efficiencyStats={efficiencyStats}
                                plans={plans}
                                goals={goals}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QualityDashboard;
