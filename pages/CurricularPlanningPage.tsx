import React, { useState, useMemo, useContext, useEffect } from 'react';
// FIX: Add missing import for GoogleGenAI.
import { GoogleGenAI } from '@google/genai';
import { MicroPlan, Class, Subject, Student, User, Role, CurricularPlanStatus, AdaptacionCurricular, Dcd, EvaluationCriterion, EvaluationIndicator } from '../types';
import { UserContext, InstitutionContext } from '../contexts/UserContext';
import { PlusIcon, EditIcon, CloseIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, PencilSquareIcon, PrinterIcon, SparklesIcon, UsersIcon, ClipboardListIcon, TrashIcon, SearchIcon } from '../components/icons/Icons';

// Sub-components are defined within this file to avoid creating new files.

// #region DCD Selection Modal
interface DcdSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedIds: string[]) => void;
    allDcds: Dcd[];
    subjectId: string;
    // gradeLevel: GradeLevel; // We'll derive this from the class
    classId: string;
    classes: Class[];
    initialSelectedIds: string[];
}
const DcdSelectionModal: React.FC<DcdSelectionModalProps> = ({ isOpen, onClose, onSave, allDcds, subjectId, classId, classes, initialSelectedIds }) => {
    const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds));
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setSelectedIds(new Set(initialSelectedIds));
    }, [initialSelectedIds, isOpen]);

    const filteredDcds = useMemo(() => {
        // We'll filter by subject, but not by grade level for now to ensure options are available in the demo.
        // In a real app with a full repository, filtering by grade level would be essential.
        return allDcds.filter(dcd => {
            const subjectMatch = dcd.subjectId === subjectId;
            const searchMatch = dcd.code.toLowerCase().includes(searchTerm.toLowerCase()) || dcd.description.toLowerCase().includes(searchTerm.toLowerCase());
            return subjectMatch && searchMatch;
        });
    }, [allDcds, subjectId, searchTerm]);

    const handleToggle = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const handleSave = () => {
        onSave(Array.from(selectedIds));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Seleccionar Destrezas (DCD)</h2><button onClick={onClose}><CloseIcon className="h-6 w-6" /></button></header>
                <div className="p-4"><input type="search" placeholder="Buscar por código o descripción..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                <main className="p-4 overflow-y-auto flex-grow">
                    <ul className="space-y-2">
                        {filteredDcds.length > 0 ? filteredDcds.map(dcd => (
                            <li key={dcd.id}>
                                <label className={`flex items-start p-3 rounded-md border cursor-pointer ${selectedIds.has(dcd.id) ? 'bg-primary-50 border-primary-300' : 'bg-white hover:bg-gray-50'}`}>
                                    <input type="checkbox" checked={selectedIds.has(dcd.id)} onChange={() => handleToggle(dcd.id)} className="mt-1 h-4 w-4 rounded text-primary-600 focus:ring-primary-500" />
                                    <div className="ml-3 text-sm">
                                        <p className="font-bold text-gray-900">{dcd.code}</p>
                                        <p className="text-gray-600">{dcd.description}</p>
                                    </div>
                                </label>
                            </li>
                        )) : <p className="text-center text-gray-500">No se encontraron destrezas para la asignatura seleccionada.</p>}
                    </ul>
                </main>
                <footer className="p-4 bg-gray-50 border-t flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button><button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-md">Guardar Selección</button></footer>
            </div>
        </div>
    );
};
// #endregion

// #region AI Generator Modal
// FIX: Moved AiGeneratorModal component definition here from ViceRectoratePage.tsx to resolve the "Cannot find name 'AiGeneratorModal'" error.
interface AiGeneratorModalProps {
    isOpen: boolean; onClose: () => void; onApply: (text: string) => void; currentSkills: string;
}
const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({ isOpen, onClose, onApply, currentSkills }) => {
    const [methodology, setMethodology] = useState('ABP (Aprendizaje Basado en Proyectos)');
    const [competency, setCompetency] = useState('Comunicacional');
    const [insertion, setInsertion] = useState('Desarrollo Sostenible');
    const [context, setContext] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [error, setError] = useState('');
    const methodologies = ["ABP (Aprendizaje Basado en Proyectos)", "Resolución de Problemas", "Debate", "Gamificación", "Aprendizaje Cooperativo"];
    const competencies = ["Comunicacional", "Lógico-Matemática", "Digital", "Socioemocional"];
    const insertions = ["Cívica/Ética", "Desarrollo Sostenible", "Socioemocional", "Seguridad Vial", "Educación Financiera"];
    const handleGenerate = async () => {
        if (!currentSkills) { setError('Las destrezas (DCDs) son necesarias para generar la metodología.'); return; }
        setError(''); setIsLoading(true); setGeneratedText('');
        const prompt = `
            Rol: Eres un asistente experto en diseño curricular ecuatoriano.
            Tarea: Genera una secuencia de actividades para la sección "Orientaciones metodológicas" de una planificación microcurricular.
            Basado en los siguientes datos:
            - Metodología Activa: ${methodology}
            - Destrezas con Criterios de Desempeño (DCDs): "${currentSkills}"
            - Inserción Curricular (Eje Transversal): ${insertion}
            - Competencia a desarrollar: ${competency}
            - Contexto local/aula: "${context || 'No se proporcionó contexto específico.'}"
            Requerimientos:
            1. Genera una situación de aprendizaje (learning situation) clara y concisa.
            2. Estructura la secuencia de actividades en tres fases claras: INICIO (anticipación), DESARROLLO (construcción), y CIERRE (consolidación).
            3. Las actividades deben ser prácticas, centradas en el estudiante y fomentar el trabajo cooperativo.
            4. Si el contexto menciona limitaciones (ej. "recursos digitales limitados"), prioriza recursos manipulativos, visuales o de bajo costo.
            5. El lenguaje debe ser profesional y adecuado para un documento de planificación docente.
            Formato de Salida (solo el texto, sin markdown adicional):
            Inicio: [Descripción de la actividad de anticipación]
            Desarrollo: [Descripción de las actividades de construcción del conocimiento]
            Cierre: [Descripción de la actividad de consolidación y reflexión]`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setGeneratedText(response.text);
        } catch (e) { console.error(e); setError('Hubo un error al generar el contenido. Por favor, inténtelo de nuevo.'); } finally { setIsLoading(false); }
    };
    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4" onClick={onClose}><div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}><header className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><SparklesIcon className="h-6 w-6 text-primary-600" />Asistente IA para Metodología</h2><button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6" /></button></header><main className="p-6 overflow-y-auto space-y-4"><p className="text-sm text-gray-600">Proporcione el contexto para generar una secuencia de actividades metodológicas. Las destrezas se tomarán del campo correspondiente en el formulario.</p><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-sm font-medium">Metodología</label><select value={methodology} onChange={e => setMethodology(e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm"><option disabled>Seleccionar</option>{methodologies.map(m => <option key={m} value={m}>{m}</option>)}</select></div><div><label className="block text-sm font-medium">Competencia</label><select value={competency} onChange={e => setCompetency(e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm"><option disabled>Seleccionar</option>{competencies.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div><label className="block text-sm font-medium">Inserción Curricular</label><select value={insertion} onChange={e => setInsertion(e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm"><option disabled>Seleccionar</option>{insertions.map(i => <option key={i} value={i}>{i}</option>)}</select></div></div><div><label className="block text-sm font-medium">Contexto Local y Restricciones</label><textarea value={context} onChange={e => setContext(e.target.value)} rows={2} placeholder="Ej: Estudiantes en zona rural con acceso limitado a internet." className="mt-1 w-full p-2 border rounded-md text-sm"></textarea></div><div className="text-center"><button onClick={handleGenerate} disabled={isLoading} className="px-6 py-2 bg-primary-600 text-white rounded-md font-semibold disabled:bg-gray-400">{isLoading ? 'Generando...' : 'Generar Secuencia'}</button></div>{error && <p className="text-red-600 text-sm text-center">{error}</p>}{generatedText && <div className="mt-4 pt-4 border-t"><h3 className="text-lg font-semibold text-gray-800 mb-2">Resultado Generado</h3><textarea readOnly value={generatedText} rows={10} className="w-full p-2 border rounded-md bg-gray-50 text-sm font-mono"></textarea><div className="text-right mt-2"><button onClick={() => onApply(generatedText)} className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold">Aplicar Texto</button></div></div>}</main></div></div>;
};
// #endregion

// #region Plan Form Component
interface PlanFormProps {
    isOpen: boolean; onClose: () => void; onSave: (plan: MicroPlan) => void;
    planToEdit: MicroPlan | null; classes: Class[]; subjects: Subject[]; students: Student[];
    teacherId: string; institutionId: string; dcds: Dcd[];
    evaluationCriteria: EvaluationCriterion[]; evaluationIndicators: EvaluationIndicator[];
}

const PlanForm: React.FC<PlanFormProps> = ({ isOpen, onClose, onSave, planToEdit, classes, subjects, students, teacherId, institutionId, dcds, evaluationCriteria, evaluationIndicators }) => {
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isDcdModalOpen, setIsDcdModalOpen] = useState(false);
    const [formData, setFormData] = useState<Omit<MicroPlan, 'id'|'institutionId'|'teacherId'|'status'|'creationDate'>>({ classId: '', subjectId: '', academicYear: '2024-2025', unitTitle: '', unitObjectives: '', dcdIds: [], methodology: '', resources: '', evaluation: '', adaptations: [] });

    useEffect(() => {
        if (planToEdit) { setFormData({ ...planToEdit, dcdIds: planToEdit.dcdIds || [] }); } 
        else { setFormData({ classId: '', subjectId: '', academicYear: '2024-2025', unitTitle: '', unitObjectives: '', dcdIds: [], methodology: 'Inicio:\n\nDesarrollo:\n\nCierre:', resources: '', evaluation: '', adaptations: [] }); }
    }, [planToEdit, isOpen]);
    
    // Auto-populate objectives and evaluation based on selected DCDs
    useEffect(() => {
        if (formData.dcdIds.length > 0) {
            const selectedDcds = formData.dcdIds.map(id => dcds.find(d => d.id === id)).filter(Boolean) as Dcd[];
            const uniqueCriterionIds = [...new Set(selectedDcds.map(d => d.criterionId))];
            
            const relevantCriteria = evaluationCriteria.filter(c => uniqueCriterionIds.includes(c.id));
            const objectivesText = relevantCriteria.map(c => `(${c.code}) ${c.description}`).join('\n\n');
            
            const relevantIndicators = evaluationIndicators.filter(i => uniqueCriterionIds.includes(i.criterionId));
            const evaluationText = relevantIndicators.map(i => `(${i.code}) ${i.description}`).join('\n\n');

            setFormData(prev => ({ ...prev, unitObjectives: objectivesText, evaluation: evaluationText }));
        }
    }, [formData.dcdIds, dcds, evaluationCriteria, evaluationIndicators]);


    const studentsInClass = useMemo(() => students.filter(s => s.classId === formData.classId), [formData.classId, students]);
    const selectedDcdObjects = useMemo(() => formData.dcdIds.map(id => dcds.find(d => d.id === id)).filter(Boolean) as Dcd[], [formData.dcdIds, dcds]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleAdaptationChange = (studentId: string, dcdModificada: string) => setFormData(p => ({ ...p, adaptations: p.adaptations.some(a => a.studentId === studentId) ? p.adaptations.map(a => a.studentId === studentId ? { ...a, dcdModificada } : a) : [...p.adaptations, { studentId, dcdModificada }] }));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const finalPlan: MicroPlan = { id: planToEdit?.id || `mp-${Date.now()}`, institutionId, teacherId, status: planToEdit?.status || CurricularPlanStatus.Draft, creationDate: planToEdit?.creationDate || new Date().toISOString(), ...formData, adaptations: formData.adaptations.filter(a => a.dcdModificada.trim() !== '') }; onSave(finalPlan); };
    const handleRemoveDcd = (dcdId: string) => setFormData(prev => ({ ...prev, dcdIds: prev.dcdIds.filter(id => id !== dcdId) }));

    if (!isOpen) return null;
    return <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}><div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}><header className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">{planToEdit ? 'Editar' : 'Crear'} Plan Microcurricular</h2><button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6" /></button></header><form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-grow"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><select name="classId" value={formData.classId} onChange={handleChange} required className="w-full p-2 border rounded-md"><option value="">Seleccionar Clase</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select name="subjectId" value={formData.subjectId} onChange={handleChange} required className="w-full p-2 border rounded-md"><option value="">Seleccionar Asignatura</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div><input type="text" name="unitTitle" value={formData.unitTitle} onChange={handleChange} placeholder="Título de la Unidad Didáctica" required className="w-full p-2 border rounded-md font-semibold"/>
            
            <div><label className="text-sm font-medium text-gray-700">Destrezas con Criterios de Desempeño</label><div className="mt-1 space-y-2">{selectedDcdObjects.map(dcd => <div key={dcd.id} className="flex justify-between items-start p-2 bg-gray-50 border rounded-md"><div className="text-sm"><p className="font-bold">{dcd.code}</p><p className="text-gray-700">{dcd.description}</p></div><button type="button" onClick={() => handleRemoveDcd(dcd.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full flex-shrink-0 ml-2"><TrashIcon className="h-4 w-4"/></button></div>)}</div><button type="button" onClick={() => setIsDcdModalOpen(true)} disabled={!formData.classId || !formData.subjectId} className="mt-2 text-sm font-semibold text-primary-600 hover:underline disabled:text-gray-400 disabled:no-underline">Añadir Destreza...</button></div>
            
            <textarea name="unitObjectives" value={formData.unitObjectives} onChange={handleChange} placeholder="Objetivos de la Unidad (autocompletado desde DCDs)" rows={3} required className="w-full p-2 border rounded-md text-sm bg-gray-50" readOnly/>
            <div><label htmlFor="methodology" className="flex items-center justify-between text-sm font-medium text-gray-700"><span>Metodología (Inicio, Desarrollo, Cierre)</span><button type="button" onClick={() => setIsAiModalOpen(true)} className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"><SparklesIcon className="h-4 w-4" />Generar con IA</button></label><textarea id="methodology" name="methodology" value={formData.methodology} onChange={handleChange} placeholder="Metodología (Inicio, Desarrollo, Cierre)" rows={5} required className="w-full p-2 border rounded-md text-sm"></textarea></div><textarea name="resources" value={formData.resources} onChange={handleChange} placeholder="Recursos" rows={3} required className="w-full p-2 border rounded-md text-sm"></textarea>
            <textarea name="evaluation" value={formData.evaluation} onChange={handleChange} placeholder="Evaluación (autocompletado desde DCDs)" rows={3} required className="w-full p-2 border rounded-md text-sm bg-gray-50" readOnly></textarea>
            
            <fieldset className="border p-4 rounded-md"><legend className="text-md font-semibold px-2 flex items-center gap-2"><UsersIcon className="h-5 w-5"/>Adaptaciones Curriculares</legend><div className="space-y-2 max-h-40 overflow-y-auto">{studentsInClass.map(student => <div key={student.id}><label className="text-sm font-medium">{student.name}</label><textarea value={formData.adaptations.find(a => a.studentId === student.id)?.dcdModificada || ''} onChange={(e) => handleAdaptationChange(student.id, e.target.value)} placeholder="Describa la DCD modificada para este estudiante..." rows={2} className="w-full p-1 border rounded-md text-sm"></textarea></div>)}{studentsInClass.length === 0 && <p className="text-sm text-center text-gray-500 py-2">Seleccione una clase para ver los estudiantes.</p>}</div></fieldset>
            
            <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Guardar Plan</button></div></form></div></div>
        <DcdSelectionModal isOpen={isDcdModalOpen} onClose={() => setIsDcdModalOpen(false)} onSave={(ids) => setFormData(p => ({...p, dcdIds: ids}))} allDcds={dcds} subjectId={formData.subjectId} classId={formData.classId} classes={classes} initialSelectedIds={formData.dcdIds} />
        {isAiModalOpen && <AiGeneratorModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} onApply={(text) => { setFormData(p => ({ ...p, methodology: text })); setIsAiModalOpen(false); }} currentSkills={selectedDcdObjects.map(d => d.description).join('\n')} />}
    </>;
};
// #endregion

// Other components remain unchanged but are included for context.
// #region Printable Plan, Plan Details, Main Page
const PrintableMicroPlan: React.FC<{ plan: MicroPlan; teacher: User | undefined; reviewer: User | undefined; subject: Subject | undefined; studentClass: Class | undefined; students: Student[]; institution: any; dcds: Dcd[] }> = ({ plan, teacher, reviewer, subject, studentClass, students, institution, dcds }) => {
    const adaptationsWithData = plan.adaptations.map(adapt => ({ ...adapt, student: students.find(s => s.id === adapt.studentId) }));
    const dcdObjects = plan.dcdIds.map(id => dcds.find(d => d.id === id)).filter(Boolean) as Dcd[];
    const skillsText = dcdObjects.map(d => `(${d.code}) ${d.description}`).join('\n');
    return <div className="bg-white p-4 font-serif text-[10px] text-gray-800 break-after-page"><table className="w-full mb-2"><tbody><tr className="align-top"><td className="w-[20%]"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Quito_brand_logo.svg/1200px-Quito_brand_logo.svg.png" alt="Quito Logo" className="h-16 w-auto" /></td><td className="w-[60%] text-center"><h1 className="font-bold text-sm">UNIDAD EDUCATIVA MUNICIPAL "{institution?.name.replace('Unidad Educativa Municipal ', '')}"</h1><p className="text-xs">“Innovación educativa y progreso para tod@s”</p><p className="text-xs">Año Lectivo {plan.academicYear}</p><p className="text-xs">Vicerrectorado-Jornada Matutina</p><div className="bg-cyan-200 border-2 border-black mt-2 p-1"><h2 className="font-bold text-sm">PLANIFICACIÓN MICROCURRICULAR</h2><h3 className="font-bold text-xs">DUA - INSERCIONES CURRICULARES</h3></div></td><td className="w-[20%] flex justify-end">{institution && <img src={institution.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />}</td></tr></tbody></table><h3 className="bg-blue-900 text-white text-center font-bold text-xs p-1">DATOS INFORMATIVOS</h3><table className="w-full border-collapse border border-black text-xs"><tbody><tr className="align-top"><td className="border border-black p-1 w-[15%]"><strong>Área o nivel:</strong></td><td className="border border-black p-1 w-[25%]">{subject?.name || 'N/A'}</td><td className="border border-black p-1 w-[15%]"><strong>Asignaturas:</strong></td><td className="border border-black p-1 w-[30%]">{subject?.name || 'N/A'}</td><td className="border border-black p-1 w-[15%]"><strong>Parcial:</strong> N/A</td></tr><tr className="align-top"><td className="border border-black p-1"><strong>Nombre del docente:</strong></td><td className="border border-black p-1">{teacher?.name || 'N/A'}</td><td colSpan={3} className="border border-black p-1"><strong>Trimestre:</strong> N/A</td></tr><tr className="align-top"><td className="border border-black p-1"><strong>Grado/Curso:</strong></td><td className="border border-black p-1">{studentClass?.name || 'N/A'}</td><td className="border border-black p-1"><strong>Paralelo:</strong> N/A</td><td className="border border-black p-1"><strong>Fecha de Inicio:</strong> {plan.creationDate ? new Date(plan.creationDate).toLocaleDateString('es-ES') : 'N/A'}</td><td className="border border-black p-1"><strong>Fecha de Finalización:</strong> {plan.submittedDate ? new Date(plan.submittedDate).toLocaleDateString('es-ES') : 'N/A'}</td></tr></tbody></table><h3 className="bg-blue-900 text-white text-center font-bold text-xs p-1 mt-2">PLANIFICACIÓN DE LOS APRENDIZAJES</h3><table className="w-full border-collapse border border-black text-xs"><tbody><tr><td className="border border-black p-1 w-[15%]"><strong>VALORES:</strong></td><td className="border border-black p-1 w-[35%]">N/A</td><td className="border border-black p-1 w-[15%]"><strong>EJE TRANSVERSAL:</strong></td><td className="border border-black p-1 w-[35%]">N/A</td></tr><tr><td className="border border-black p-1"><strong>OBJETIVO/S DE APRENDIZAJES:</strong></td><td colSpan={3} className="border border-black p-1 whitespace-pre-wrap">{plan.unitObjectives}</td></tr></tbody></table><h3 className="bg-blue-900 text-white text-center font-bold text-xs p-1 mt-2">RELACIONES ENTRE LOS COMPONENTES CURRICULARES- AJUSTES RAZONABLES</h3><table className="w-full border-collapse border border-black mt-1 text-[9px]"><thead><tr className="font-bold text-center bg-gray-100"><td className="border border-black p-1 w-[15%]">DESTREZAS CON CRITERIOS DE DESEMPEÑO</td><td className="border border-black p-1 w-[15%]">INDICADORES DE EVALUACIÓN</td><td className="border border-black p-1 w-[35%]">ESTRATEGIAS METODOLÓGICAS</td><td className="border border-black p-1 w-[20%]">RECURSOS</td><td className="border border-black p-1 w-[15%]">TÉCNICAS /INSTRUMENTOS DE EVALUACIÓN</td></tr></thead><tbody><tr className="align-top"><td className="border border-black p-1 whitespace-pre-wrap">{skillsText}</td><td className="border border-black p-1">N/A</td><td className="border border-black p-1 whitespace-pre-wrap">{plan.methodology}</td><td className="border border-black p-1 whitespace-pre-wrap">{plan.resources}</td><td className="border border-black p-1 whitespace-pre-wrap">{plan.evaluation}</td></tr></tbody></table>{adaptationsWithData.length > 0 && <div className="mt-2 break-before-page"><h3 className="bg-blue-900 text-white text-center font-bold text-xs p-1">PLANIFICACIÓN CON ADAPTACIONES CURRICULARES DE LOS ESTUDIANTES CON NEE</h3><table className="w-full border-collapse border border-black mt-1 text-[9px]"><thead><tr className="font-bold text-center bg-gray-100"><td className="border border-black p-1">Estudiante</td><td className="border border-black p-1">Necesidad Educativa</td><td className="border border-black p-1">DESTREZAS (Desagregada)</td><td className="border border-black p-1">INDICADORES</td><td className="border border-black p-1">ESTRATEGIAS</td><td className="border border-black p-1">RECURSOS</td><td className="border border-black p-1">EVALUACIÓN</td></tr></thead><tbody>{adaptationsWithData.map(adapt => <tr key={adapt.studentId} className="align-top"><td className="border border-black p-1">{adapt.student?.name || 'N/A'}</td><td className="border border-black p-1">N/A</td><td className="border border-black p-1 whitespace-pre-wrap">{adapt.dcdModificada}</td><td className="border border-black p-1">N/A</td><td className="border border-black p-1">N/A</td><td className="border border-black p-1">N/A</td><td className="border border-black p-1">N/A</td></tr>)}</tbody></table></div>}<div className="mt-4 break-before-page"><h3 className="bg-blue-900 text-white text-center font-bold text-xs p-1">RESPONSABLES</h3><table className="w-full border-collapse border border-black mt-1 text-xs"><thead><tr><th className="border border-black p-1">Elaborado Por:</th><th className="border border-black p-1">Revisado Por:</th><th className="border border-black p-1">Aprobado por:</th></tr></thead><tbody><tr className="align-bottom h-24 text-center"><td className="border border-black p-1"><p className="mt-16 border-t border-gray-400 mx-4">{teacher?.name}</p><p className="font-bold">DOCENTE</p></td><td className="border border-black p-1"><p className="mt-16 border-t border-gray-400 mx-4">{reviewer?.name}</p><p className="font-bold">COORDINADOR DE ÁREA</p></td><td className="border border-black p-1"><p className="mt-16 border-t border-gray-400 mx-4">{reviewer?.name}</p><p className="font-bold">VICERRECTOR</p></td></tr><tr><td className="border border-black p-1"><strong>Fecha:</strong> {plan.creationDate ? new Date(plan.creationDate).toLocaleDateString('es-ES') : ''}</td><td className="border border-black p-1"><strong>Fecha:</strong> {plan.submittedDate ? new Date(plan.submittedDate).toLocaleDateString('es-ES') : ''}</td><td className="border border-black p-1"><strong>Fecha:</strong> {plan.reviewDate ? new Date(plan.reviewDate).toLocaleDateString('es-ES') : ''}</td></tr></tbody></table></div></div>;
};

interface PlanDetailsProps { plan: MicroPlan; onClose: () => void; onSetStatus: (planId: string, status: CurricularPlanStatus, comments?: string) => void; onPrint: (plan: MicroPlan) => void; userRole: Role; users: User[]; subjects: Subject[]; classes: Class[]; students: Student[]; dcds: Dcd[] }
const PlanDetails: React.FC<PlanDetailsProps> = ({ plan, onClose, onSetStatus, onPrint, userRole, users, subjects, classes, students, dcds }) => {
    const [reviewComments, setReviewComments] = useState('');
    const reviewerName = useMemo(() => users.find(u => u.id === plan.reviewerId)?.name, [plan.reviewerId, users]);
    const isReviewer = userRole === Role.Vicerrector || userRole === Role.InstitutionAdmin;
    const dcdObjects = useMemo(() => plan.dcdIds.map(id => dcds.find(d => d.id === id)).filter(Boolean) as Dcd[], [plan.dcdIds, dcds]);
    const skillsText = dcdObjects.map(d => `(${d.code}) ${d.description}`).join('\n\n');
    const handleRequestAdjustments = () => { if (!reviewComments.trim()) { alert('Por favor, ingrese los comentarios para solicitar ajustes.'); return; } onSetStatus(plan.id, CurricularPlanStatus.RequiresAdjustments, reviewComments); };
    const InfoSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => <div><h4 className="text-sm font-bold text-gray-700 mb-1 tracking-wider uppercase border-b pb-1">{title}</h4><div className="text-gray-800 text-sm whitespace-pre-wrap">{children}</div></div>;
    return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}><div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}><header className="p-4 border-b flex justify-between items-start"><div><h2 className="text-xl font-bold text-gray-800">{plan.unitTitle}</h2><p className="text-sm text-gray-500">{classes.find(c => c.id === plan.classId)?.name} - {subjects.find(s => s.id === plan.subjectId)?.name}</p></div><button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6" /></button></header><main className="p-6 overflow-y-auto space-y-6"><InfoSection title="Objetivos de la Unidad">{plan.unitObjectives}</InfoSection><InfoSection title="Destrezas con Criterios de Desempeño">{skillsText}</InfoSection><InfoSection title="Metodología">{plan.methodology}</InfoSection><InfoSection title="Recursos">{plan.resources}</InfoSection><InfoSection title="Evaluación">{plan.evaluation}</InfoSection><div><h4 className="text-sm font-bold text-gray-700 mb-1 tracking-wider uppercase border-b pb-1">Adaptaciones Curriculares</h4>{plan.adaptations.length > 0 ? <ul className="space-y-2 mt-2">{plan.adaptations.map(adapt => <li key={adapt.studentId} className="p-2 bg-gray-50 rounded-md border text-sm"><p className="font-semibold">{students.find(s => s.id === adapt.studentId)?.name || 'Estudiante Desconocido'}</p><p className="text-gray-600 whitespace-pre-wrap">{adapt.dcdModificada}</p></li>)}</ul> : <p className="text-sm text-gray-500 mt-2">No se registraron adaptaciones.</p>}</div>{plan.status === CurricularPlanStatus.RequiresAdjustments && <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400"><h4 className="font-bold text-yellow-800">Comentarios para Ajuste</h4><p className="text-sm text-yellow-700 mt-1 whitespace-pre-wrap"><strong>{reviewerName}:</strong> {plan.reviewComments}</p></div>}</main><footer className="p-4 bg-gray-50 border-t">{isReviewer && plan.status === CurricularPlanStatus.PendingReview && <div className="space-y-2"><textarea value={reviewComments} onChange={e => setReviewComments(e.target.value)} rows={3} placeholder="Añadir comentarios para solicitar ajustes (opcional)..." className="w-full p-2 border rounded-md text-sm"></textarea><div className="flex justify-end gap-2"><button onClick={handleRequestAdjustments} className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-semibold">Solicitar Ajustes</button><button onClick={() => onSetStatus(plan.id, CurricularPlanStatus.Approved)} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold">Aprobar Plan</button></div></div>}{plan.status === CurricularPlanStatus.Approved && <div className="flex justify-end"><button onClick={() => onPrint(plan)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700"><PrinterIcon className="h-5 w-5" />Imprimir / Descargar PDF</button></div>}</footer></div></div>;
};

interface CurricularPlanningPageProps {
  microPlans: MicroPlan[]; onUpdateMicroPlans: (plans: MicroPlan[]) => void;
  classes: Class[]; subjects: Subject[]; students: Student[]; users: User[];
  dcds: Dcd[]; evaluationCriteria: EvaluationCriterion[]; evaluationIndicators: EvaluationIndicator[];
}

const CurricularPlanningPage: React.FC<CurricularPlanningPageProps> = ({ microPlans, onUpdateMicroPlans, classes, subjects, students, users, dcds, evaluationCriteria, evaluationIndicators }) => {
    const { user: currentUser } = useContext(UserContext);
    const { institution } = useContext(InstitutionContext);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<MicroPlan | null>(null);
    const [printingPlan, setPrintingPlan] = useState<MicroPlan | null>(null);
    const isReviewer = currentUser?.role === Role.Vicerrector || currentUser?.role === Role.InstitutionAdmin;
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    const classMap = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
    const plansForView = useMemo(() => { if (!currentUser) return []; const iPlans = microPlans.filter(p => p.institutionId === currentUser.institutionId); return isReviewer ? iPlans : iPlans.filter(p => p.teacherId === currentUser.id); }, [currentUser, microPlans, isReviewer]);
    const handleOpenForm = (plan: MicroPlan|null) => { setSelectedPlan(plan); setIsFormOpen(true); };
    const handleOpenDetails = (plan: MicroPlan) => { setSelectedPlan(plan); setIsDetailsOpen(true); };
    const handleSave = (planToSave: MicroPlan) => { const exists = microPlans.some(p=>p.id===planToSave.id); onUpdateMicroPlans(exists ? microPlans.map(p => p.id === planToSave.id ? planToSave : p) : [...microPlans, planToSave]); setIsFormOpen(false); };
    const handleSetStatus = (planId: string, status: CurricularPlanStatus, comments?: string) => { onUpdateMicroPlans(microPlans.map(p => p.id === planId ? { ...p, status, reviewComments: comments || p.reviewComments, reviewerId: currentUser!.id, reviewDate: new Date().toISOString() } : p)); if (status === CurricularPlanStatus.Approved || status === CurricularPlanStatus.RequiresAdjustments) setIsDetailsOpen(false); };
    const handleSubmitForReview = (planId: string) => { onUpdateMicroPlans(microPlans.map(p => p.id === planId ? { ...p, status: CurricularPlanStatus.PendingReview, submittedDate: new Date().toISOString() } : p)); setIsDetailsOpen(false); };
    const handlePrint = (plan: MicroPlan) => { setPrintingPlan(plan); setIsDetailsOpen(false); };
    const statusConfig: Record<CurricularPlanStatus, { text: string, color: string, icon: React.ReactNode }> = { [CurricularPlanStatus.Draft]: { text: 'Borrador', color: 'bg-gray-100 text-gray-800', icon: <PencilSquareIcon className="h-4 w-4" /> }, [CurricularPlanStatus.PendingReview]: { text: 'En Revisión', color: 'bg-blue-100 text-blue-800', icon: <ClockIcon className="h-4 w-4" /> }, [CurricularPlanStatus.RequiresAdjustments]: { text: 'Requiere Ajustes', color: 'bg-yellow-100 text-yellow-800', icon: <ExclamationTriangleIcon className="h-4 w-4" /> }, [CurricularPlanStatus.Approved]: { text: 'Aprobado', color: 'bg-green-100 text-green-800', icon: <CheckCircleIcon className="h-4 w-4" /> } };
    return <div className="space-y-6"><div className="bg-white p-6 rounded-xl shadow-md"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">Planificación Microcurricular</h2>{!isReviewer && <button onClick={() => handleOpenForm(null)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><PlusIcon className="h-5 w-5" />Crear Plan</button>}</div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidad Didáctica</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clase/Asignatura</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th><th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{plansForView.map(plan => <tr key={plan.id} className="hover:bg-gray-50"><td className="px-4 py-3"><p className="font-semibold">{plan.unitTitle}</p>{isReviewer && <p className="text-xs text-gray-500">{userMap.get(plan.teacherId)}</p>}</td><td className="px-4 py-3 text-sm text-gray-600">{classMap.get(plan.classId)}<br/>{subjectMap.get(plan.subjectId)}</td><td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[plan.status].color}`}>{statusConfig[plan.status].icon}{statusConfig[plan.status].text}</span></td><td className="px-4 py-3 text-right space-x-2"><button onClick={() => handleOpenDetails(plan)} className="px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200">Ver</button>{!isReviewer && (plan.status === CurricularPlanStatus.Draft || plan.status === CurricularPlanStatus.RequiresAdjustments) && <button onClick={() => handleOpenForm(plan)} className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">Editar</button>}{!isReviewer && (plan.status === CurricularPlanStatus.Draft || plan.status === CurricularPlanStatus.RequiresAdjustments) && <button onClick={() => handleSubmitForReview(plan.id)} className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200">{plan.status === CurricularPlanStatus.RequiresAdjustments ? 'Re-enviar a Revisión' : 'Enviar a Revisión'}</button>}</td></tr>)}</tbody></table></div></div>{isFormOpen && currentUser && <PlanForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSave} planToEdit={selectedPlan} classes={classes} subjects={subjects} students={students} teacherId={currentUser.id} institutionId={currentUser.institutionId!} dcds={dcds} evaluationCriteria={evaluationCriteria} evaluationIndicators={evaluationIndicators} />}{isDetailsOpen && selectedPlan && currentUser && <PlanDetails plan={selectedPlan} onClose={() => setIsDetailsOpen(false)} onSetStatus={handleSetStatus} onPrint={handlePrint} userRole={currentUser.role} users={users} subjects={subjects} classes={classes} students={students} dcds={dcds} />}{printingPlan && currentUser && <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4"><div id="microplan-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col"><header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10"><h3 className="text-lg font-semibold text-gray-700">Vista Previa del Reporte</h3><div className="flex items-center gap-2"><button onClick={() => setPrintingPlan(null)} className="px-4 py-2 bg-gray-200 rounded-md">Cerrar</button><button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md"><PrinterIcon className="h-5 w-5" />Imprimir / PDF</button></div></header><div className="overflow-y-auto"><PrintableMicroPlan plan={printingPlan} teacher={users.find(u => u.id === printingPlan.teacherId)} reviewer={users.find(u => u.id === printingPlan.reviewerId)} subject={subjects.find(s => s.id === printingPlan.subjectId)} studentClass={classes.find(c => c.id === printingPlan.classId)} students={students} institution={institution} dcds={dcds}/></div></div></div>}</div>;
};
// #endregion
// #endregion

export default CurricularPlanningPage;