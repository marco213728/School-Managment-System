
import React, { useState, useEffect } from 'react';
import { ClassroomVisit, User, Class, Subject, RubricScore } from '../../types';
import { DEFAULT_RUBRIC_CRITERIA } from '../../constants';
import { CloseIcon, CheckCircleIcon, CalendarIcon } from '../icons/Icons';

interface ClassroomVisitFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (visit: ClassroomVisit) => void;
    visitToEdit: ClassroomVisit | null;
    teachers: User[];
    classes: Class[];
    subjects: Subject[];
    currentUser: User;
}

const ClassroomVisitForm: React.FC<ClassroomVisitFormProps> = ({ isOpen, onClose, onSave, visitToEdit, teachers, classes, subjects, currentUser }) => {
    const [mode, setMode] = useState<'planning' | 'execution'>('planning');
    const [formData, setFormData] = useState<Partial<ClassroomVisit>>({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        teacherId: '',
        className: '',
        subject: '',
        topic: '',
        focus: 'Metodología DUA',
        status: 'Scheduled',
        scores: [],
        strengths: '',
        weaknesses: '',
        agreements: '',
    });

    const [rubricScores, setRubricScores] = useState<Record<string, { score: number; evidence: string }>>({});

    useEffect(() => {
        if (visitToEdit) {
            setFormData({ ...visitToEdit });
            if (visitToEdit.status === 'Completed') {
                setMode('execution');
                // Hydrate rubric scores
                const scoresMap: Record<string, { score: number; evidence: string }> = {};
                visitToEdit.scores?.forEach(s => {
                    scoresMap[s.criteriaId] = { score: s.score, evidence: s.evidence || '' };
                });
                setRubricScores(scoresMap);
            } else {
                setMode('planning');
            }
        } else {
            setFormData({
                id: undefined,
                institutionId: currentUser.institutionId,
                observerId: currentUser.id,
                date: new Date().toISOString().split('T')[0],
                startTime: '',
                teacherId: '',
                className: '',
                subject: '',
                topic: '',
                focus: 'Metodología DUA',
                status: 'Scheduled',
                scores: [],
            });
            setRubricScores({});
            setMode('planning');
        }
    }, [visitToEdit, isOpen, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRubricChange = (criteriaId: string, field: 'score' | 'evidence', value: any) => {
        setRubricScores(prev => ({
            ...prev,
            [criteriaId]: {
                ...prev[criteriaId] || { score: 0, evidence: '' },
                [field]: value
            }
        }));
    };

    const calculateAverage = () => {
        const scores = Object.values(rubricScores).map((s: { score: number }) => s.score).filter((s: number) => s > 0);
        if (scores.length === 0) return 0;
        const sum = scores.reduce((a, b) => a + b, 0);
        return parseFloat((sum / scores.length).toFixed(2));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalData = { ...formData };

        if (mode === 'execution') {
            const packedScores: RubricScore[] = Object.entries(rubricScores).map(([id, val]: [string, any]) => ({
                criteriaId: id,
                score: val.score,
                evidence: val.evidence
            }));
            
            finalData.scores = packedScores;
            finalData.rating = calculateAverage();
            finalData.status = 'Completed';
        } else {
            finalData.status = 'Scheduled';
        }

        if (!finalData.id) {
            finalData.id = `visit-${Date.now()}`;
        }

        onSave(finalData as ClassroomVisit);
    };

    if (!isOpen) return null;

    const getScoreColor = (score: number) => {
        if (score === 4) return 'bg-green-100 text-green-800 border-green-200';
        if (score === 3) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (score === 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4 border-b pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {mode === 'planning' ? 'Planificar Visita Áulica' : 'Ejecutar Acompañamiento Áulico'}
                        </h2>
                        <p className="text-sm text-gray-500">{mode === 'planning' ? 'Agendar y notificar al docente' : 'Evaluar práctica docente y registrar evidencias'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-6">
                    {/* Planning Section */}
                    <section className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${mode === 'execution' ? 'opacity-80 pointer-events-none bg-gray-50 p-4 rounded-lg border' : ''}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Docente</label>
                            <select name="teacherId" value={formData.teacherId} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md">
                                <option value="">Seleccionar Docente</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                            <div className="flex gap-2">
                                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Clase / Curso</label>
                             <input type="text" name="className" value={formData.className} onChange={handleChange} list="classes-list" required className="mt-1 w-full p-2 border rounded-md" placeholder="Ej: 10mo EGB A"/>
                             <datalist id="classes-list">
                                 {classes.map(c => <option key={c.id} value={c.name} />)}
                             </datalist>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Asignatura</label>
                             <input type="text" name="subject" value={formData.subject} onChange={handleChange} list="subjects-list" required className="mt-1 w-full p-2 border rounded-md" placeholder="Ej: Matemáticas"/>
                             <datalist id="subjects-list">
                                 {subjects.map(s => <option key={s.id} value={s.name} />)}
                             </datalist>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700">Tema de Clase (Opcional)</label>
                             <input type="text" name="topic" value={formData.topic} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" placeholder="Tema a tratar"/>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Enfoque de Observación</label>
                             <select name="focus" value={formData.focus} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md">
                                 <option value="Metodología DUA">Metodología DUA</option>
                                 <option value="Uso de TIC">Uso de TIC</option>
                                 <option value="Clima de Aula">Clima de Aula</option>
                                 <option value="Adaptación Curricular">Adaptación Curricular</option>
                                 <option value="General">General</option>
                             </select>
                        </div>
                    </section>

                    {mode === 'planning' && visitToEdit && visitToEdit.status === 'Scheduled' && (
                        <div className="flex justify-center py-4">
                            <button type="button" onClick={() => setMode('execution')} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5" />
                                Iniciar Visita / Evaluación
                            </button>
                        </div>
                    )}

                    {/* Execution Section (Rubric) */}
                    {mode === 'execution' && (
                        <section className="space-y-6 border-t pt-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary-600"/>
                                Rúbrica de Evaluación Digital
                            </h3>
                            <div className="space-y-4">
                                {DEFAULT_RUBRIC_CRITERIA.map(criteria => {
                                    const current = rubricScores[criteria.id] || { score: 0, evidence: '' };
                                    return (
                                        <div key={criteria.id} className="border p-4 rounded-lg bg-gray-50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-xs font-bold uppercase text-primary-700 tracking-wider">{criteria.category}</span>
                                                    <p className="font-medium text-gray-900">{criteria.description}</p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-white p-1 rounded border">
                                                    {[1, 2, 3, 4].map(score => (
                                                        <button
                                                            key={score}
                                                            type="button"
                                                            onClick={() => handleRubricChange(criteria.id, 'score', score)}
                                                            className={`w-8 h-8 rounded-md font-bold text-sm transition-colors ${current.score === score ? getScoreColor(score) : 'text-gray-400 hover:bg-gray-100'}`}
                                                        >
                                                            {score}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <textarea 
                                                placeholder="Evidencia observada (obligatorio para puntajes bajos/altos)..." 
                                                value={current.evidence}
                                                onChange={(e) => handleRubricChange(criteria.id, 'evidence', e.target.value)}
                                                className="w-full p-2 border rounded-md text-sm"
                                                rows={2}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fortalezas</label>
                                    <textarea name="strengths" value={formData.strengths} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md" placeholder="Aspectos positivos destacados..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Debilidades / Áreas de Mejora</label>
                                    <textarea name="weaknesses" value={formData.weaknesses} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md" placeholder="Aspectos a mejorar..."></textarea>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Acuerdos y Compromisos</label>
                                <textarea name="agreements" value={formData.agreements} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md" placeholder="Compromisos del docente para la próxima visita..."></textarea>
                            </div>
                            
                            <div className="flex justify-end items-center gap-4 bg-primary-50 p-4 rounded-lg">
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Calificación Promedio</p>
                                    <p className="text-2xl font-bold text-primary-700">{calculateAverage()} / 4</p>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="flex justify-end gap-4 pt-4 border-t mt-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                            {mode === 'planning' ? 'Agendar Visita y Notificar' : 'Finalizar y Guardar Acta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassroomVisitForm;
