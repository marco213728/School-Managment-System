
import React, { useState, useEffect } from 'react';
import { SubjectReport, Student, Dcd, User, Subject, Class, Gradebook, MicroPlan, ReinforcementPlan, CurricularPlanStatus } from '../../types';
import { CloseIcon, PlusIcon, TrashIcon, SparklesIcon } from '../icons/Icons';

interface SubjectReportFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (report: SubjectReport) => void;
    reportToEdit?: SubjectReport | null;
    classId: string;
    subjectId: string;
    teacherId: string;
    students: Student[];
    dcds: Dcd[];
    currentUser: User;
    classes: Class[];
    subjects: Subject[];
    // New props for integration
    gradebooks: Gradebook[];
    microPlans: MicroPlan[];
    reinforcementPlans: ReinforcementPlan[];
}

const SubjectReportForm: React.FC<SubjectReportFormProps> = ({ 
    isOpen, onClose, onSave, reportToEdit, classId, subjectId, teacherId, students, dcds, currentUser, classes, subjects,
    gradebooks = [], microPlans = [], reinforcementPlans = [] 
}) => {
    const [formData, setFormData] = useState<Partial<SubjectReport>>({
        dcdsCovered: [],
        difficulties: [],
        conclusions: '',
        recommendations: ''
    });

    // Helper to get names
    const className = classes.find(c => c.id === classId)?.name || 'Clase Desconocida';
    const subjectName = subjects.find(s => s.id === subjectId)?.name || 'Asignatura Desconocida';

    useEffect(() => {
        if (reportToEdit) {
            setFormData(JSON.parse(JSON.stringify(reportToEdit)));
        } else {
             setFormData({
                id: `sr-${Date.now()}`,
                institutionId: currentUser.institutionId,
                classId,
                subjectId,
                teacherId,
                trimester: 1, // Default, ideally passed as prop or derived from context
                academicYear: '2025-2026',
                status: 'Draft',
                dcdsCovered: [],
                difficulties: [],
                conclusions: '',
                recommendations: ''
            });
        }
    }, [reportToEdit, isOpen, classId, subjectId, teacherId, currentUser]);

    const handleAutofill = () => {
        if (!formData.trimester) return;
        
        // 1. Autofill DCDs from Approved MicroPlans
        const relevantPlans = microPlans.filter(p => 
            p.classId === classId && 
            p.subjectId === subjectId && 
            p.status === CurricularPlanStatus.Approved
            // In a real app, check date/trimester logic here
        );
        
        const coveredDcds = Array.from(new Set(relevantPlans.flatMap(p => p.dcdIds)));
        
        // 2. Autofill Difficulties from Gradebook
        const gradebook = gradebooks.find(gb => gb.classId === classId && gb.subjectId === subjectId);
        const newDifficulties = [...(formData.difficulties || [])];
        
        if (gradebook) {
            gradebook.records.forEach(record => {
                const trimesterData = record[`trimester${formData.trimester as 1|2|3}`];
                // Check if average is low (e.g., less than 7)
                if (trimesterData && trimesterData.sumaTrimestre < 7) {
                    // Check if already added
                    if (!newDifficulties.some(d => d.studentId === record.studentId)) {
                        
                        // Check for existing Reinforcement Plan
                        const plan = reinforcementPlans.find(p => p.studentId === record.studentId && p.subjectId === subjectId);
                        
                        let measures = "Requiere Refuerzo Académico.";
                        if (plan) {
                            measures = `Plan de Refuerzo iniciado (${plan.modalidad === 'inside_class' ? 'En clase' : 'Extra-clase'}). Estado: ${plan.status === 'Completed' ? 'Finalizado' : 'En proceso'}.`;
                        }

                        newDifficulties.push({
                            studentId: record.studentId,
                            difficulty: 'Bajo rendimiento académico (Promedio < 7)',
                            cause: 'Por determinar en entrevista.',
                            measure: measures,
                            results: 'En seguimiento.',
                            minGrade: trimesterData.sumaTrimestre,
                            improvedGrade: 0 // To be filled after supletorio/refuerzo
                        });
                    }
                }
            });
        }

        // 3. Generate Conclusions based on data
        const totalStudents = students.length;
        const lowPerforming = newDifficulties.length;
        const passRate = ((totalStudents - lowPerforming) / totalStudents) * 100;
        
        const autoConclusion = `Se han trabajado ${coveredDcds.length} destrezas planificadas. El ${passRate.toFixed(1)}% de los estudiantes ha alcanzado los aprendizajes requeridos. Se detectan ${lowPerforming} casos que requieren seguimiento.`;

        setFormData(prev => ({
            ...prev,
            dcdsCovered: coveredDcds,
            difficulties: newDifficulties,
            conclusions: prev.conclusions ? prev.conclusions + "\n" + autoConclusion : autoConclusion
        }));

        alert(`Datos importados:\n- ${coveredDcds.length} Destrezas encontradas\n- ${newDifficulties.length} Estudiantes con bajo rendimiento detectados`);
    };

    const handleDcdToggle = (code: string) => {
        const current = formData.dcdsCovered || [];
        const updated = current.includes(code) ? current.filter(c => c !== code) : [...current, code];
        setFormData(prev => ({ ...prev, dcdsCovered: updated }));
    };

    const handleAddDifficulty = () => {
        setFormData(prev => ({
            ...prev,
            difficulties: [...(prev.difficulties || []), { studentId: '', difficulty: '', cause: '', measure: '', results: '' }]
        }));
    };

    const handleDifficultyChange = (index: number, field: keyof typeof formData.difficulties[0], value: any) => {
        const newDifficulties = [...(formData.difficulties || [])];
        newDifficulties[index] = { ...newDifficulties[index], [field]: value };
        setFormData(prev => ({ ...prev, difficulties: newDifficulties }));
    };
    
    const handleRemoveDifficulty = (index: number) => {
        setFormData(prev => ({ ...prev, difficulties: prev.difficulties?.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as SubjectReport);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4 border-b pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Informe de Asignatura (Pre-Junta)</h2>
                        <p className="text-sm text-gray-600">{className} - {subjectName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6" /></button>
                </header>

                <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-center justify-between">
                    <div className="text-sm text-blue-800">
                        <span className="font-bold">Asistente Inteligente:</span> Importa datos de calificaciones, planificación y refuerzo automáticamente.
                    </div>
                    <button 
                        type="button" 
                        onClick={handleAutofill}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 shadow-sm"
                    >
                        <SparklesIcon className="h-4 w-4" />
                        Autocompletar Datos
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-6">
                    
                    {/* Section 1: DCDs */}
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <h3 className="font-bold text-gray-700 mb-2">1. Destrezas Trabajadas (Competencias)</h3>
                        <div className="max-h-40 overflow-y-auto grid grid-cols-1 gap-2">
                            {dcds.filter(d => d.subjectId === subjectId).map(dcd => (
                                <label key={dcd.id} className="flex items-start gap-2 p-2 bg-white border rounded cursor-pointer hover:bg-blue-50">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.dcdsCovered?.includes(dcd.code)} 
                                        onChange={() => handleDcdToggle(dcd.code)}
                                        className="mt-1 h-4 w-4 text-primary-600"
                                    />
                                    <div className="text-xs">
                                        <span className="font-bold">{dcd.code}</span>: {dcd.description}
                                    </div>
                                </label>
                            ))}
                            {dcds.filter(d => d.subjectId === subjectId).length === 0 && <p className="text-sm text-gray-500">No hay destrezas registradas para esta asignatura.</p>}
                        </div>
                    </div>

                    {/* Section 2: Difficulties */}
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-700">2. Análisis de Dificultades de Aprendizaje</h3>
                            <button type="button" onClick={handleAddDifficulty} className="text-xs flex items-center gap-1 bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200">
                                <PlusIcon className="h-3 w-3" /> Añadir Caso
                            </button>
                        </div>
                        {formData.difficulties?.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-2 p-2 border rounded bg-white relative">
                                <div className="lg:col-span-1">
                                    <select 
                                        value={item.studentId} 
                                        onChange={e => handleDifficultyChange(idx, 'studentId', e.target.value)}
                                        className="w-full p-1 border rounded text-xs"
                                    >
                                        <option value="">Estudiante...</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="lg:col-span-1"><textarea placeholder="Dificultad" value={item.difficulty} onChange={e => handleDifficultyChange(idx, 'difficulty', e.target.value)} rows={2} className="w-full p-1 border rounded text-xs"/></div>
                                <div className="lg:col-span-1"><textarea placeholder="Causa" value={item.cause} onChange={e => handleDifficultyChange(idx, 'cause', e.target.value)} rows={2} className="w-full p-1 border rounded text-xs"/></div>
                                <div className="lg:col-span-1"><textarea placeholder="Medidas Adoptadas" value={item.measure} onChange={e => handleDifficultyChange(idx, 'measure', e.target.value)} rows={2} className="w-full p-1 border rounded text-xs"/></div>
                                <div className="lg:col-span-1"><textarea placeholder="Resultados/Mejora" value={item.results} onChange={e => handleDifficultyChange(idx, 'results', e.target.value)} rows={2} className="w-full p-1 border rounded text-xs"/></div>
                                <div className="lg:col-span-1 flex flex-col gap-1">
                                     <input type="number" placeholder="Nota Min" value={item.minGrade || ''} onChange={e => handleDifficultyChange(idx, 'minGrade', parseFloat(e.target.value))} className="w-full p-1 border rounded text-xs" />
                                     <input type="number" placeholder="Nota Refuerzo" value={item.improvedGrade || ''} onChange={e => handleDifficultyChange(idx, 'improvedGrade', parseFloat(e.target.value))} className="w-full p-1 border rounded text-xs" />
                                </div>
                                <button type="button" onClick={() => handleRemoveDifficulty(idx)} className="absolute top-1 right-1 text-red-400 hover:text-red-600"><TrashIcon className="h-3 w-3"/></button>
                            </div>
                        ))}
                        {formData.difficulties?.length === 0 && <p className="text-xs text-gray-500 italic text-center py-2">Sin novedades reportadas. Haga clic en Autocompletar para buscar estudiantes en riesgo.</p>}
                    </div>

                    {/* Section 3 & 4: Conclusions & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">3. Conclusiones</label>
                            <textarea value={formData.conclusions} onChange={e => setFormData(p => ({...p, conclusions: e.target.value}))} rows={4} className="w-full p-2 border rounded-md text-sm" placeholder="Análisis del rendimiento general..."></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">4. Recomendaciones</label>
                            <textarea value={formData.recommendations} onChange={e => setFormData(p => ({...p, recommendations: e.target.value}))} rows={4} className="w-full p-2 border rounded-md text-sm" placeholder="Sugerencias para mejorar..."></textarea>
                        </div>
                    </div>
                </form>

                <footer className="mt-4 pt-4 border-t flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-gray-700">Cancelar</button>
                    <button type="button" onClick={() => onSave({ ...formData, status: 'Draft' } as SubjectReport)} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md border border-blue-200">Guardar Borrador</button>
                    <button type="button" onClick={() => onSave({ ...formData, status: 'Submitted', submissionDate: new Date().toISOString() } as SubjectReport)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold">Enviar a Vicerrectorado</button>
                </footer>
            </div>
        </div>
    );
};

export default SubjectReportForm;
